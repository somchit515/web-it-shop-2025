# IT HUBB — DFD Level 0 (Context Diagram)

> ແຜນຜັງການໄຫຼຂໍ້ມູນລະດັບ 0 — ສະແດງລະບົບທັງໝົດເປັນ process ດຽວ  
> ພ້ອມ External Entities ທີ່ຕິດຕໍ່ກັບລະບົບ ແລະ ທິດທາງການໄຫຼຂໍ້ມູນ

```mermaid
flowchart LR
    %% ── Styles ────────────────────────────────────────────────────────────
    classDef actor   fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#c7d2fe,font-size:13px
    classDef system  fill:#064e3b,stroke:#10b981,stroke-width:4px,color:#a7f3d0,font-size:15px,font-weight:bold
    classDef svc     fill:#431407,stroke:#f97316,stroke-width:2px,color:#fed7aa,font-size:12px
    classDef bank    fill:#1c1917,stroke:#f59e0b,stroke-width:2px,color:#fcd34d,font-size:12px

    %% ══════════════════════════════════════════════════════════════════════
    %%  EXTERNAL ENTITIES (Left — Human Actors)
    %% ══════════════════════════════════════════════════════════════════════
    CUST["👤 ລູກຄ້າ\nCustomer"]
    ADMIN["🛠️ Admin\nຜູ້ດູແລລະບົບ"]
    SADMIN["👑 SuperAdmin\nຜູ້ດູແລສູງສຸດ"]

    %% ══════════════════════════════════════════════════════════════════════
    %%  CENTRAL PROCESS
    %% ══════════════════════════════════════════════════════════════════════
    SYS(("🛒 ລະບົບ IT HUBB\ne-Commerce System"))

    %% ══════════════════════════════════════════════════════════════════════
    %%  EXTERNAL SERVICES (Right — 3rd-party Systems)
    %% ══════════════════════════════════════════════════════════════════════
    GOOGLE["🔐 Google OAuth\nAuthentication"]
    CLOUD["☁️ Cloudinary\nCloud Image Storage"]
    SMTP["📧 SMTP Service\nEmail Provider"]
    PUSH["🔔 Web Push\nPush Notification"]
    BANK["🏦 ທະນາຄານ\nBCEL / LDB / JDB"]
    CARRIER["🚚 ຂົນສົ່ງ\nAnusit / MaiSay / United"]

    %% ══════════════════════════════════════════════════════════════════════
    %%  DATA FLOWS — ລູກຄ້າ
    %% ══════════════════════════════════════════════════════════════════════
    CUST -->|"ຂໍ້ມູນລົງທະບຽນ / Login"| SYS
    CUST -->|"ຄຳສັ່ງຊື້ + ທີ່ຢູ່ + carrier"| SYS
    CUST -->|"ສະຫຼິບໂອນເງິນ"| SYS
    CUST -->|"ລະຫັດ Coupon"| SYS
    CUST -->|"ຄະແນນ + ຄຳຄິດເຫັນ"| SYS

    SYS -->|"ລາຍການສິນຄ້າ + ລາຄາ"| CUST
    SYS -->|"ສະຖານະ Order + Tracking"| CUST
    SYS -->|"Invoice / ໃບຮັບເງິນ"| CUST
    SYS -->|"ແຈ້ງເຕືອນ Email + Push"| CUST

    %% ══════════════════════════════════════════════════════════════════════
    %%  DATA FLOWS — Admin
    %% ══════════════════════════════════════════════════════════════════════
    ADMIN -->|"CRUD ສິນຄ້າ + Category"| SYS
    ADMIN -->|"ຢືນຢັນ / ປະຕິເສດ ການຊຳລະ"| SYS
    ADMIN -->|"ອັບເດດ Fulfillment Status"| SYS
    ADMIN -->|"ຈັດການ Flash Deal"| SYS
    ADMIN -->|"ຂຽນ / ເຜີຍແຜ່ Blog"| SYS

    SYS -->|"Dashboard + ສະຖິຕິ"| ADMIN
    SYS -->|"ລາຍການ Order ລໍຖ້າ"| ADMIN
    SYS -->|"ລາຍການ ສະລິບ ທີ່ຕ້ອງ verify"| ADMIN

    %% ══════════════════════════════════════════════════════════════════════
    %%  DATA FLOWS — SuperAdmin
    %% ══════════════════════════════════════════════════════════════════════
    SADMIN -->|"ສ້າງ / ຈັດການ User"| SYS
    SADMIN -->|"ສ້າງ / ແກ້ Coupon"| SYS
    SADMIN -->|"ບັນທຶກ Financial Transaction"| SYS

    SYS -->|"ລາຍງານ Sales / Finance"| SADMIN
    SYS -->|"Customer Analytics"| SADMIN
    SYS -->|"ຂໍ້ມູນ User ທັງໝົດ"| SADMIN

    %% ══════════════════════════════════════════════════════════════════════
    %%  DATA FLOWS — External Services
    %% ══════════════════════════════════════════════════════════════════════
    SYS    -->|"Auth Request + redirect"| GOOGLE
    GOOGLE -->|"Google Profile\n(name, email, avatar)"| SYS

    SYS   -->|"Upload ຮູບ (Product / Avatar / Proof)"| CLOUD
    CLOUD -->|"Image URL + public_id"| SYS

    SYS  -->|"Email Content\n(Order / Shipping / Cancel)"| SMTP
    SMTP -->|"Delivery Status"| SYS

    SYS  -->|"Push Payload\n(Order alert)"| PUSH
    PUSH -->|"Subscription endpoint"| SYS

    BANK -->|"ຂໍ້ມູນ Account\n(ສຳລັບ Bank Transfer)"| SYS

    SYS     -->|"ຂໍ້ມູນຈັດສົ່ງ + Tracking Code"| CARRIER
    CARRIER -->|"Tracking Update\n(ໂດຍ Admin)"| SYS

    %% ── Apply classes ──────────────────────────────────────────────────
    class CUST,ADMIN,SADMIN actor
    class SYS system
    class GOOGLE,CLOUD,SMTP,PUSH svc
    class BANK,CARRIER bank
```

---

## 📋 ສຸດທ້າຍ External Entities

| Entity | ປະເພດ | Data Flow ເຂົ້າລະບົບ | Data Flow ອອກຈາກລະບົບ |
|--------|--------|----------------------|----------------------|
| 👤 **ລູກຄ້າ** | Human Actor | ລົງທະບຽນ, ຄຳສັ່ງ, ສະຫຼິບ, Coupon, Review | ລາຍການສິນຄ້າ, ສະຖານະ, Invoice, ແຈ້ງເຕືອນ |
| 🛠️ **Admin** | Human Actor | CRUD ສິນຄ້າ, verify ຊຳລະ, update status, FlashDeal, Blog | Dashboard, Order list, Payment proofs |
| 👑 **SuperAdmin** | Human Actor | ຈັດການ User, Coupon, Financial record | ລາຍງານ Sales/Finance, Analytics |
| 🔐 **Google OAuth** | External System | Google Profile (name, email, avatar) | Auth redirect request |
| ☁️ **Cloudinary** | External Service | Image URL + public_id | ໄຟລ໌ຮູບ (Product/Avatar/Proof) |
| 📧 **SMTP Email** | External Service | Delivery status | Email content (Order/Ship/Cancel) |
| 🔔 **Web Push** | External Service | Subscription endpoint | Push notification payload |
| 🏦 **ທະນາຄານ** | External System | Bank account info | — (display only) |
| 🚚 **ຂົນສົ່ງ** | External Partner | Tracking update (via Admin) | Ship info + Tracking code |

---

## 🔄 ກຸ່ມ Data Flows ຫຼັກ

```
ລູກຄ້າ  ──► [ລົງທະບຽນ / Auth]     ──► ລະບົບ ──► [ຂໍ້ມູນ Profile]   ──► Google
ລູກຄ້າ  ──► [ຄຳສັ່ງ + ທີ່ຢູ່]       ──► ລະບົບ ──► [ສາລິບ / Status]  ──► ລູກຄ້າ
ລູກຄ້າ  ──► [ສະຫຼິບໂອນ]            ──► ລະບົບ ──► [Email / Push]    ──► ລູກຄ້າ
Admin   ──► [Verify + Update]      ──► ລະບົບ ──► [Dashboard]       ──► Admin
Admin   ──► [CRUD ສິນຄ້າ]          ──► ລະບົບ ──► [Upload Image]    ──► Cloudinary
ລະບົບ   ──► [Tracking Code]        ──► ຂົນສົ່ງ ──► [Update]         ──► ລະບົບ
```
