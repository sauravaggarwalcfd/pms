from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import StreamingResponse
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
from io import BytesIO
from fpdf import FPDF

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    PURCHASER = "purchaser"
    APPROVER = "approver"
    WAREHOUSE = "warehouse"
    FINANCE = "finance"

class ApprovalStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"

class PRStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    CONVERTED = "converted"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Supplier(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None
    rating: float = 5.0
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SupplierCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None

class Item(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    sku: str
    description: Optional[str] = None
    category: str
    unit: str = "pcs"
    unit_price: float
    quantity: int = 0
    reorder_level: int = 10
    supplier_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemCreate(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    category: str
    unit: str = "pcs"
    unit_price: float
    quantity: int = 0
    reorder_level: int = 10
    supplier_id: Optional[str] = None

class LineItem(BaseModel):
    item_id: str
    item_name: str
    quantity: int
    unit_price: float
    total: float

class PurchaseRequisition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pr_number: str
    requester_id: str
    requester_name: str
    department: str
    items: List[LineItem]
    total_amount: float
    status: PRStatus = PRStatus.DRAFT
    justification: Optional[str] = None
    required_by: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PRCreate(BaseModel):
    requester_id: str
    requester_name: str
    department: str
    items: List[LineItem]
    justification: Optional[str] = None
    required_by: Optional[datetime] = None

class PurchaseOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    po_number: str
    pr_id: Optional[str] = None
    supplier_id: str
    supplier_name: str
    items: List[LineItem]
    total_amount: float
    status: ApprovalStatus = ApprovalStatus.DRAFT
    approval_level: int = 0
    approved_by: List[str] = []
    delivery_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class POCreate(BaseModel):
    pr_id: Optional[str] = None
    supplier_id: str
    supplier_name: str
    items: List[LineItem]
    delivery_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_by: str

class GoodsReceipt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    gr_number: str
    po_id: str
    po_number: str
    items: List[LineItem]
    received_by: str
    received_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
    status: str = "completed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GRCreate(BaseModel):
    po_id: str
    items: List[LineItem]
    received_by: str
    notes: Optional[str] = None

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    po_id: str
    gr_id: Optional[str] = None
    supplier_id: str
    supplier_name: str
    items: List[LineItem]
    total_amount: float
    tax_amount: float = 0
    status: str = "pending"
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    po_id: str
    gr_id: Optional[str] = None
    supplier_id: str
    items: List[LineItem]
    tax_amount: float = 0
    due_date: Optional[datetime] = None

# PDF Generator
class PDFGenerator:
    @staticmethod
    def generate_po_pdf(po: PurchaseOrder, supplier: Supplier) -> BytesIO:
        pdf = FPDF()
        pdf.add_page()
        
        # Header
        pdf.set_font('Helvetica', 'B', 20)
        pdf.cell(0, 10, 'PURCHASE ORDER', 0, 1, 'C')
        pdf.ln(5)
        
        # PO Info
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(0, 6, f'PO Number: {po.po_number}', 0, 1)
        pdf.cell(0, 6, f'Date: {po.created_at.strftime("%Y-%m-%d")}', 0, 1)
        pdf.cell(0, 6, f'Status: {po.status.value.upper()}', 0, 1)
        pdf.ln(5)
        
        # Supplier Info
        pdf.set_font('Helvetica', 'B', 12)
        pdf.cell(0, 8, 'VENDOR DETAILS', 0, 1)
        pdf.set_font('Helvetica', '', 10)
        pdf.cell(0, 6, f'Name: {supplier.name}', 0, 1)
        if supplier.address:
            pdf.cell(0, 6, f'Address: {supplier.address}', 0, 1)
        if supplier.email:
            pdf.cell(0, 6, f'Email: {supplier.email}', 0, 1)
        if supplier.phone:
            pdf.cell(0, 6, f'Phone: {supplier.phone}', 0, 1)
        pdf.ln(5)
        
        # Items Table
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(80, 8, 'Item', 1, 0, 'C')
        pdf.cell(30, 8, 'Quantity', 1, 0, 'C')
        pdf.cell(40, 8, 'Unit Price', 1, 0, 'C')
        pdf.cell(40, 8, 'Total', 1, 1, 'C')
        
        pdf.set_font('Helvetica', '', 9)
        for item in po.items:
            pdf.cell(80, 7, item.item_name[:30], 1, 0)
            pdf.cell(30, 7, str(item.quantity), 1, 0, 'C')
            pdf.cell(40, 7, f'${item.unit_price:.2f}', 1, 0, 'R')
            pdf.cell(40, 7, f'${item.total:.2f}', 1, 1, 'R')
        
        # Total
        pdf.set_font('Helvetica', 'B', 10)
        pdf.cell(150, 8, 'TOTAL', 1, 0, 'R')
        pdf.cell(40, 8, f'${po.total_amount:.2f}', 1, 1, 'R')
        
        if po.notes:
            pdf.ln(5)
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(0, 6, 'Notes:', 0, 1)
            pdf.set_font('Helvetica', '', 9)
            pdf.multi_cell(0, 5, po.notes)
        
        output = BytesIO()
        output.write(pdf.output())
        output.seek(0)
        return output

# Auth Routes
@api_router.post("/auth/register", response_model=User)
async def register(user: UserCreate):
    user_dict = user.model_dump()
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login")
async def login(credentials: LoginRequest):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or user['password'] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user['created_at'] = datetime.fromisoformat(user['created_at'])
    return {"user": user, "token": f"token_{user['id']}"}

# Supplier Routes
@api_router.post("/suppliers", response_model=Supplier)
async def create_supplier(supplier: SupplierCreate):
    supplier_dict = supplier.model_dump()
    supplier_obj = Supplier(**supplier_dict)
    doc = supplier_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.suppliers.insert_one(doc)
    return supplier_obj

@api_router.get("/suppliers", response_model=List[Supplier])
async def get_suppliers():
    suppliers = await db.suppliers.find({}, {"_id": 0}).to_list(1000)
    for s in suppliers:
        s['created_at'] = datetime.fromisoformat(s['created_at'])
    return suppliers

@api_router.get("/suppliers/{supplier_id}", response_model=Supplier)
async def get_supplier(supplier_id: str):
    supplier = await db.suppliers.find_one({"id": supplier_id}, {"_id": 0})
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    supplier['created_at'] = datetime.fromisoformat(supplier['created_at'])
    return supplier

@api_router.put("/suppliers/{supplier_id}", response_model=Supplier)
async def update_supplier(supplier_id: str, supplier: SupplierCreate):
    result = await db.suppliers.update_one({"id": supplier_id}, {"$set": supplier.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    updated = await db.suppliers.find_one({"id": supplier_id}, {"_id": 0})
    updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

# Items/Inventory Routes
@api_router.post("/items", response_model=Item)
async def create_item(item: ItemCreate):
    item_dict = item.model_dump()
    item_obj = Item(**item_dict)
    doc = item_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.items.insert_one(doc)
    return item_obj

@api_router.get("/items", response_model=List[Item])
async def get_items():
    items = await db.items.find({}, {"_id": 0}).to_list(1000)
    for i in items:
        i['created_at'] = datetime.fromisoformat(i['created_at'])
    return items

@api_router.get("/items/low-stock", response_model=List[Item])
async def get_low_stock_items():
    items = await db.items.find({"_id": 0}).to_list(1000)
    low_stock = [i for i in items if i.get('quantity', 0) <= i.get('reorder_level', 0)]
    for i in low_stock:
        i['created_at'] = datetime.fromisoformat(i['created_at'])
    return low_stock

@api_router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str):
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item['created_at'] = datetime.fromisoformat(item['created_at'])
    return item

@api_router.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: str, item: ItemCreate):
    result = await db.items.update_one({"id": item_id}, {"$set": item.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    updated = await db.items.find_one({"id": item_id}, {"_id": 0})
    updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

# Purchase Requisition Routes
@api_router.post("/purchase-requisitions", response_model=PurchaseRequisition)
async def create_pr(pr: PRCreate):
    count = await db.purchase_requisitions.count_documents({})
    pr_dict = pr.model_dump()
    total = sum(item.total for item in pr.items)
    pr_obj = PurchaseRequisition(**pr_dict, pr_number=f"PR-{count+1:05d}", total_amount=total)
    doc = pr_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('required_by'):
        doc['required_by'] = doc['required_by'].isoformat()
    await db.purchase_requisitions.insert_one(doc)
    return pr_obj

@api_router.get("/purchase-requisitions", response_model=List[PurchaseRequisition])
async def get_prs():
    prs = await db.purchase_requisitions.find({}, {"_id": 0}).to_list(1000)
    for pr in prs:
        pr['created_at'] = datetime.fromisoformat(pr['created_at'])
        pr['updated_at'] = datetime.fromisoformat(pr['updated_at'])
        if pr.get('required_by'):
            pr['required_by'] = datetime.fromisoformat(pr['required_by'])
    return prs

@api_router.put("/purchase-requisitions/{pr_id}/approve")
async def approve_pr(pr_id: str):
    result = await db.purchase_requisitions.update_one(
        {"id": pr_id},
        {"$set": {"status": PRStatus.APPROVED.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="PR not found")
    return {"message": "PR approved"}

# Purchase Order Routes
@api_router.post("/purchase-orders", response_model=PurchaseOrder)
async def create_po(po: POCreate):
    count = await db.purchase_orders.count_documents({})
    po_dict = po.model_dump()
    total = sum(item.total for item in po.items)
    po_obj = PurchaseOrder(**po_dict, po_number=f"PO-{count+1:05d}", total_amount=total)
    doc = po_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('delivery_date'):
        doc['delivery_date'] = doc['delivery_date'].isoformat()
    await db.purchase_orders.insert_one(doc)
    return po_obj

@api_router.get("/purchase-orders", response_model=List[PurchaseOrder])
async def get_pos():
    pos = await db.purchase_orders.find({}, {"_id": 0}).to_list(1000)
    for po in pos:
        po['created_at'] = datetime.fromisoformat(po['created_at'])
        po['updated_at'] = datetime.fromisoformat(po['updated_at'])
        if po.get('delivery_date'):
            po['delivery_date'] = datetime.fromisoformat(po['delivery_date'])
    return pos

@api_router.get("/purchase-orders/{po_id}", response_model=PurchaseOrder)
async def get_po(po_id: str):
    po = await db.purchase_orders.find_one({"id": po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    po['created_at'] = datetime.fromisoformat(po['created_at'])
    po['updated_at'] = datetime.fromisoformat(po['updated_at'])
    if po.get('delivery_date'):
        po['delivery_date'] = datetime.fromisoformat(po['delivery_date'])
    return po

@api_router.put("/purchase-orders/{po_id}/approve")
async def approve_po(po_id: str, approver_id: str = Query(...)):
    po = await db.purchase_orders.find_one({"id": po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    approved_by = po.get('approved_by', [])
    approved_by.append(approver_id)
    new_level = po.get('approval_level', 0) + 1
    
    # Auto-approve if > $10k needs 2 levels, else 1
    required_levels = 2 if po['total_amount'] > 10000 else 1
    new_status = ApprovalStatus.APPROVED.value if new_level >= required_levels else ApprovalStatus.PENDING.value
    
    result = await db.purchase_orders.update_one(
        {"id": po_id},
        {"$set": {
            "status": new_status,
            "approval_level": new_level,
            "approved_by": approved_by,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"message": "PO approved", "status": new_status}

@api_router.get("/purchase-orders/{po_id}/pdf")
async def download_po_pdf(po_id: str):
    po_doc = await db.purchase_orders.find_one({"id": po_id}, {"_id": 0})
    if not po_doc:
        raise HTTPException(status_code=404, detail="PO not found")
    
    po_doc['created_at'] = datetime.fromisoformat(po_doc['created_at'])
    po_doc['updated_at'] = datetime.fromisoformat(po_doc['updated_at'])
    if po_doc.get('delivery_date'):
        po_doc['delivery_date'] = datetime.fromisoformat(po_doc['delivery_date'])
    po = PurchaseOrder(**po_doc)
    
    supplier_doc = await db.suppliers.find_one({"id": po.supplier_id}, {"_id": 0})
    if not supplier_doc:
        raise HTTPException(status_code=404, detail="Supplier not found")
    supplier_doc['created_at'] = datetime.fromisoformat(supplier_doc['created_at'])
    supplier = Supplier(**supplier_doc)
    
    pdf_bytes = PDFGenerator.generate_po_pdf(po, supplier)
    
    return StreamingResponse(
        iter([pdf_bytes.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=PO_{po.po_number}.pdf"}
    )

# Goods Receipt Routes
@api_router.post("/goods-receipts", response_model=GoodsReceipt)
async def create_gr(gr: GRCreate):
    count = await db.goods_receipts.count_documents({})
    po = await db.purchase_orders.find_one({"id": gr.po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    gr_dict = gr.model_dump()
    gr_obj = GoodsReceipt(**gr_dict, gr_number=f"GR-{count+1:05d}", po_number=po['po_number'])
    doc = gr_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['received_date'] = doc['received_date'].isoformat()
    await db.goods_receipts.insert_one(doc)
    
    # Update inventory
    for item in gr.items:
        await db.items.update_one(
            {"id": item.item_id},
            {"$inc": {"quantity": item.quantity}}
        )
    
    return gr_obj

@api_router.get("/goods-receipts", response_model=List[GoodsReceipt])
async def get_grs():
    grs = await db.goods_receipts.find({}, {"_id": 0}).to_list(1000)
    for gr in grs:
        gr['created_at'] = datetime.fromisoformat(gr['created_at'])
        gr['received_date'] = datetime.fromisoformat(gr['received_date'])
    return grs

# Invoice Routes
@api_router.post("/invoices", response_model=Invoice)
async def create_invoice(invoice: InvoiceCreate):
    count = await db.invoices.count_documents({})
    po = await db.purchase_orders.find_one({"id": invoice.po_id}, {"_id": 0})
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    invoice_dict = invoice.model_dump()
    total = sum(item.total for item in invoice.items)
    invoice_obj = Invoice(
        **invoice_dict,
        invoice_number=f"INV-{count+1:05d}",
        supplier_name=po['supplier_name'],
        total_amount=total
    )
    doc = invoice_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('due_date'):
        doc['due_date'] = doc['due_date'].isoformat()
    if doc.get('paid_date'):
        doc['paid_date'] = doc['paid_date'].isoformat()
    await db.invoices.insert_one(doc)
    return invoice_obj

@api_router.get("/invoices", response_model=List[Invoice])
async def get_invoices():
    invoices = await db.invoices.find({}, {"_id": 0}).to_list(1000)
    for inv in invoices:
        inv['created_at'] = datetime.fromisoformat(inv['created_at'])
        if inv.get('due_date'):
            inv['due_date'] = datetime.fromisoformat(inv['due_date'])
        if inv.get('paid_date'):
            inv['paid_date'] = datetime.fromisoformat(inv['paid_date'])
    return invoices

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_suppliers = await db.suppliers.count_documents({})
    total_items = await db.items.count_documents({})
    total_pos = await db.purchase_orders.count_documents({})
    pending_approvals = await db.purchase_orders.count_documents({"status": "pending"})
    low_stock_count = len([i for i in await db.items.find({}, {"_id": 0}).to_list(1000) if i.get('quantity', 0) <= i.get('reorder_level', 0)])
    
    # Recent POs for chart
    recent_pos = await db.purchase_orders.find({}, {"_id": 0}).sort("created_at", -1).limit(30).to_list(30)
    
    return {
        "total_suppliers": total_suppliers,
        "total_items": total_items,
        "total_pos": total_pos,
        "pending_approvals": pending_approvals,
        "low_stock_count": low_stock_count,
        "recent_activity": len(recent_pos)
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()