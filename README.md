# 🚀 Papelería Los Piwis — Inventory Management System

> **Seminario de Integración: Desarrollo** · [ENG VERSION]

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=22&pause=1000&color=10B981&center=true&vCenter=true&width=600&lines=Hi+there%2C+we+are+Paper+System-LP+%F0%9F%91%8B;Inventory+Management+for+Papeler%C3%ADa+Los+Piwis;Search%2C+control+and+restock+faster+%F0%9F%93%A6" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://paper-system-lp.onrender.com">
    <img src="https://img.shields.io/badge/Live_demo-paper--system--lp.onrender.com-10b981?style=for-the-badge&logo=render&logoColor=white" alt="Live demo" />
  </a>
  <a href="https://app.notion.com/p/Papeler-a-Los-Piwis-18384f90ffdc8268a0f30170807e15dd?source=copy_link">
    <img src="https://img.shields.io/badge/Kanban_Board-Notion-000000?style=for-the-badge&logo=notion&logoColor=white" alt="Kanban board on Notion" />
  </a>
</p>

---

## 📖 Table of contents

- [About the project](#-about-the-project)
- [User guide](#-user-guide)
- [Our team](#-our-team)
- [Tech stack](#️-tech-stack)
- [Run it locally](#️-run-it-locally)
- [Kanban board](#-kanban-board)

---

## 🧑‍💻 About the project

### Proposed solution

A web application for **Papelería Los Piwis** that centralizes the registration, consultation and control of inventory, assigning each product a standard **location code** (aisle · rack · shelf, e.g. `P1-A2-E3`). The owner registers products, stock levels and locations; employees keep stock up to date; customers browse the catalog and prepare their orders. The system flags out-of-stock and low-stock products, which reduces search time, improves restocking and makes better use of the available space.

### ✨ Features

**Available now**

- 🔐 Sign up / log in with four levels of access: visitor, customer, employee and owner
- 🛍️ Public catalog with prices and availability (no account needed to look)
- 🛒 Shopping cart for logged-in users
- 🔎 Search by name, code, category or location, and filters by category and stock status
- 🏷️ Standard location code for every product
- ⚠️ Automatic **Available / Low stock / Out of stock** status
- 📦 Stock movements (entries, exits, adjustments) with a record of who made each one
- 👤 User profile: edit data, change password, close account
- 🛠️ Owner panels to manage products and users

**Planned**

- 🧾 Order confirmation and order tracking ("Mis pedidos")
- 📈 Product classification according to demand
- 💵 Sales and reports for the owner

> *"First, solve the problem. Then, write the code."*

---

## 📘 User guide

### 1. How to open the system

1. Go to **https://paper-system-lp.onrender.com**
2. ⏳ The first visit after a period of inactivity can take **up to one minute** while the server wakes up (free hosting plan). Just wait; the next pages load normally.
3. No installation is needed. It works in any modern browser, on computer or phone.

### 2. What each person can do

| | 👀 Visitor | 🛍️ Customer | 🧑‍💼 Employee | 👑 Owner |
|---|:---:|:---:|:---:|:---:|
| See the home page, catalog and prices | ✅ | ✅ | ✅ | ✅ |
| Search and filter products | ✅ | ✅ | ✅ | ✅ |
| Add products to the cart | ❌ | ✅ | ✅ | ✅ |
| Edit own profile | ❌ | ✅ | ✅ | ✅ |
| Close own account | ❌ | ✅ | ❌ | ❌ |
| Register stock entries, exits and adjustments | ❌ | ❌ | ✅ | ✅ |
| Change a product's location | ❌ | ❌ | ✅ | ✅ |
| Create products, change prices, deactivate products | ❌ | ❌ | ❌ | ✅ |
| Manage users (give or remove the employee role) | ❌ | ❌ | ❌ | ✅ |

> Visitors are anyone without an account or without a session. What you see on each page depends on your role, but the **server always checks permissions again**, so hiding a button is never the only protection.

### 3. Create an account and log in

1. Click **Iniciar sesión** (Log in) at the top right.
2. Choose the **Crear cuenta** (Create account) tab and fill in your full name, e-mail and a password (at least 8 characters, with letters and numbers). Repeat the password to confirm it.
3. Go back to **Iniciar sesión**, enter your e-mail and password and press **Entrar**.
4. When you are logged in, the top-right link changes to **Hola, your name · Mi perfil**.

Everyone who registers starts as a **customer**. Employee and owner roles are assigned by the owner (see below).

### 4. Browse the products

- **Home page:** image carousel, product categories, and the inventory with a search bar and filters (**Todos / Stock bajo / Agotados**).
- **Catálogo:** every product in its own card with price, code and status. Sort by name or price, and filter by category.
- **Location code:** read it left to right. `P1-A2-E3` = **P**asillo (aisle) 1 · **A**naquel (rack) 2 · **E**stante (shelf) 3.
- **Status colors:** 🟢 Disponible · 🟠 Stock bajo (running out) · 🔴 Agotado (none left).

### 5. Use the cart (logged-in users)

1. In **Catálogo**, choose a quantity with **−** / **+** and press **Agregar al carrito**.
2. Open the 🛒 icon at the top to review your cart: change quantities, remove products and see the total.
3. The quantity can never exceed the stock available. Your cart is saved in your browser, separately for each user.
4. 🚧 **Confirmar pedido** (confirm order) is not enabled yet; it is the next feature on the roadmap.

> Visitors see the same cards and prices, but instead of the cart button they see **Inicia sesión para pedir** (log in to order).

### 6. Your profile

Open **Mi perfil** to see your name, e-mail, role and member-since date.

1. Tick **Confirmo que quiero realizar cambios en mi cuenta** (the buttons stay locked until you do).
2. **Modificar datos:** change your name, e-mail and, optionally, your password. For safety you must always type your **current password**.
3. **Eliminar cuenta** (customers only): type `ELIMINAR` and your password. The account is **deactivated** (you can no longer log in) and your history is kept; the owner can reactivate it.

### 7. Employee guide 🧑‍💼

Employees see **Administrar productos** inside **Mi perfil**.

- **Movimiento:** register an *Entrada* (goods arrived), *Salida* (sale or use), or a positive/negative adjustment. A movement can never leave the stock below zero.
- **Editar:** an employee can only change the product's **location**. Name, code, category, price and minimum stock are reserved for the owner.

### 8. Owner guide 👑

The owner has everything above, plus:

- **Nuevo producto:** register code, name, category, location, price, minimum stock and initial stock. Categories and locations can be created from the **+** buttons.
- **Editar:** change any field, including the **price**.
- **Desactivar / Activar:** hide a product from the public pages without deleting its history.
- **Usuarios** (page `usuario.html`): turn customers into employees (or back) and activate or deactivate accounts. You cannot change your own role, and other owners cannot be modified from the page.

> The very first owner is assigned directly in the database (see [Run it locally](#️-run-it-locally)). It is intentionally not possible to become owner from the website.

### 9. Troubleshooting

| Problem | What to do |
|---|---|
| The page takes a long time to open | Wait up to a minute and refresh; the server was asleep. |
| "No se pudieron cargar los productos" | Refresh with `Ctrl + Shift + R`. If it persists, tell the team. |
| I don't see the cart button | You are not logged in. Log in first. |
| I can't see "Administrar productos" | Only employees and the owner have it. Ask the owner to change your role. |
| I changed my role but nothing changed | Reload the page (`Ctrl + Shift + R`). |
| I can't log in | Check your e-mail and password. Your account may be deactivated; ask the owner. |

---

## 👥 Our Team

<p align="center">
  <a href="https://github.com/orlandofierros1824-arch/Paper-System-LP/commits/main"><img src="https://img.shields.io/github/commit-activity/t/orlandofierros1824-arch/Paper-System-LP?label=total%20commits&color=10b981" alt="Total commits" /></a>
  <a href="https://github.com/orlandofierros1824-arch/Paper-System-LP/graphs/contributors"><img src="https://img.shields.io/github/contributors/orlandofierros1824-arch/Paper-System-LP?color=10b981" alt="Contributors" /></a>
  <img src="https://img.shields.io/github/last-commit/orlandofierros1824-arch/Paper-System-LP?color=10b981" alt="Last commit" />
</p>

Each counter is read live from this repository's commit history, so it updates by itself. Full detail: [Contributors graph](https://github.com/orlandofierros1824-arch/Paper-System-LP/graphs/contributors).

<table align="center">
  <tr>
    <th align="center">Photo</th>
    <th align="center">User</th>
    <th align="center">Commits in this project</th>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/AnnGlez"><img src="https://github.com/AnnGlez.png" width="90" alt="AnnGlez" /></a></td>
    <td align="center"><a href="https://github.com/AnnGlez"><b>AnnGlez</b></a><br/>Angel Gonzalez Flores</td>
    <td align="center">
      <img src="https://img.shields.io/github/commit-activity/t/orlandofierros1824-arch/Paper-System-LP?authorFilter=AnnGlez&label=total&color=10b981" alt="AnnGlez total commits" /><br/>
      <img src="https://img.shields.io/github/commit-activity/m/orlandofierros1824-arch/Paper-System-LP?authorFilter=AnnGlez&label=this%20month&color=0ea5e9" alt="AnnGlez commits this month" />
    </td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/10miguelan"><img src="https://github.com/10miguelan.png" width="90" alt="10miguelan" /></a></td>
    <td align="center"><a href="https://github.com/10miguelan"><b>10miguelan</b></a></td>
    <td align="center">
      <img src="https://img.shields.io/github/commit-activity/t/orlandofierros1824-arch/Paper-System-LP?authorFilter=10miguelan&label=total&color=10b981" alt="10miguelan total commits" /><br/>
      <img src="https://img.shields.io/github/commit-activity/m/orlandofierros1824-arch/Paper-System-LP?authorFilter=10miguelan&label=this%20month&color=0ea5e9" alt="10miguelan commits this month" />
    </td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/erikmclovin2004"><img src="https://github.com/erikmclovin2004.png" width="90" alt="erikmclovin2004" /></a></td>
    <td align="center"><a href="https://github.com/erikmclovin2004"><b>erikmclovin2004</b></a></td>
    <td align="center">
      <img src="https://img.shields.io/github/commit-activity/t/orlandofierros1824-arch/Paper-System-LP?authorFilter=erikmclovin2004&label=total&color=10b981" alt="erikmclovin2004 total commits" /><br/>
      <img src="https://img.shields.io/github/commit-activity/m/orlandofierros1824-arch/Paper-System-LP?authorFilter=erikmclovin2004&label=this%20month&color=0ea5e9" alt="erikmclovin2004 commits this month" />
    </td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/uribeedgar081-gif"><img src="https://github.com/uribeedgar081-gif.png" width="90" alt="uribeedgar081-gif" /></a></td>
    <td align="center"><a href="https://github.com/uribeedgar081-gif"><b>uribeedgar081-gif</b></a><br/>EAdrian_UP</td>
    <td align="center">
      <img src="https://img.shields.io/github/commit-activity/t/orlandofierros1824-arch/Paper-System-LP?authorFilter=uribeedgar081-gif&label=total&color=10b981" alt="uribeedgar081-gif total commits" /><br/>
      <img src="https://img.shields.io/github/commit-activity/m/orlandofierros1824-arch/Paper-System-LP?authorFilter=uribeedgar081-gif&label=this%20month&color=0ea5e9" alt="uribeedgar081-gif commits this month" />
    </td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/orlandofierros1824-arch"><img src="https://github.com/orlandofierros1824-arch.png" width="90" alt="orlandofierros1824-arch" /></a></td>
    <td align="center"><a href="https://github.com/orlandofierros1824-arch"><b>orlandofierros1824-arch</b></a></td>
    <td align="center">
      <img src="https://img.shields.io/github/commit-activity/t/orlandofierros1824-arch/Paper-System-LP?authorFilter=orlandofierros1824-arch&label=total&color=10b981" alt="orlandofierros1824-arch total commits" /><br/>
      <img src="https://img.shields.io/github/commit-activity/m/orlandofierros1824-arch/Paper-System-LP?authorFilter=orlandofierros1824-arch&label=this%20month&color=0ea5e9" alt="orlandofierros1824-arch commits this month" />
    </td>
  </tr>
</table>

### 📬 Contact us

- orlando.fierros1824@alumnos.udg.mx
- miguel.lobo4231@alumno.udg.mx
- erik.guardado3220@alumnos.udg.mx
- edgar.uribe0684@alumno.udg.mx
- angel.gonzalez0345@alumnos.udg.mx

---

## 🛠️ Tech Stack

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Plain HTML, CSS and JavaScript (no framework), responsive for computer, tablet and phone.

### Backend & Database
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

Security: passwords hashed with **bcryptjs**, sessions with **JSON Web Tokens** in an HTTP-only cookie, **helmet** headers and **express-rate-limit** against brute-force attempts. Database access with **mysql2** over SSL.

### Hosting & Tools
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Aiven](https://img.shields.io/badge/Aiven-FF3554?style=for-the-badge&logo=aiven&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![MySQL Workbench](https://img.shields.io/badge/MySQL_Workbench-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)

The web service is hosted on **Render** and the MySQL database on **Aiven**.

---

## ⚙️ Run it locally

> You only need this to develop. To simply use the system, open the [live demo](https://paper-system-lp.onrender.com).

### 1. Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (LTS version) and npm
- Access to the project's MySQL database (ask the team for the connection details)

### 2. Clone and install

```bash
git clone https://github.com/orlandofierros1824-arch/Paper-System-LP.git
cd Paper-System-LP/papeleria_lp
npm install
```

### 3. Configure environment variables

Create a file named `.env` inside `papeleria_lp/` (it is already listed in `.gitignore`; **never upload it to GitHub**):

```env
DB_HOST=your-mysql-host
DB_PORT=your-mysql-port
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=papeleria_los_piwis
JWT_SECRET=a-long-random-secret
```

The server connects to MySQL over SSL and reads the certificate from `papeleria_lp/ca.pem`.

### 4. Prepare the database

1. Run the project's SQL script (`Papeleria_Los_Piwis_Final.sql`) to create the tables.
2. Create the three roles the system needs (without them, registration fails):

```sql
INSERT INTO roles (codigo, nombre, descripcion) VALUES
    ('DUENO',    'Dueño',    'Control total del sistema'),
    ('EMPLEADO', 'Empleado', 'Administra productos y existencias'),
    ('CLIENTE',  'Cliente',  'Consulta el inventario')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
```

### 5. Start the server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Create the first owner

1. Create your account from the website (**Iniciar sesión → Crear cuenta**).
2. Promote it in the database, using your own e-mail in lowercase:

```sql
UPDATE usuarios
   SET id_rol = (SELECT id_rol FROM roles WHERE codigo = 'DUENO')
 WHERE correo = 'your_email@example.com';
```

3. Reload the site: **Mi perfil** now shows the links to manage products and users.

### 📁 Project structure

```
Paper-System-LP/
├── README.md
└── papeleria_lp/
    ├── server.js          # Express server, API and permissions
    ├── package.json
    ├── ca.pem             # public SSL certificate for the database
    └── public/            # everything the browser loads
        ├── index.html     # home
        ├── catalogo.html  # catalog and cart
        ├── login.html     # log in / sign up
        ├── perfil.html    # my profile
        ├── productos.html # product management (employee / owner)
        ├── usuario.html   # user management (owner)
        ├── *.css, *.js    # styles and behavior of each page
        └── img/           # images
```

---

## 📋 Kanban Board

We organize our work in a Notion Kanban board (tasks, progress, and responsibilities per team member):

👉 **[Open the Papelería Los Piwis Kanban board](https://app.notion.com/p/Papeler-a-Los-Piwis-18384f90ffdc8268a0f30170807e15dd?source=copy_link)**

| Column | Meaning |
|--------|---------|
| 📝 To do | Tasks that are planned but not started |
| 🚧 In progress | Tasks currently being worked on |
| 🔎 In review | Tasks waiting for team review or testing |
| ✅ Done | Completed tasks |

> Make sure the Notion page is shared with "Anyone with the link" so teachers and visitors can open it.

---

<p align="center">
  <i>⭐️ Made with ❤️ by <b>Paper System-LP</b> for Papelería Los Piwis</i>
</p>
