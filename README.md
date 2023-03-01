# mini ecommerce
Video demo [Clone git project và triển khai web application youtu.be](https://youtu.be/YkTWRHM7alo)
# Clone this ecommerce project nodejs[express]
  B1: Clone by git `https://github.com/DHoa0202/ecommerce.git` or download [ecommerce.zip](../../archive/refs/heads/main.zip) and extract to folder<br/>
```diff
git clone https://github.com/DHoa0202/ecommerce.git
```
  B2: Add folder to workspace has been extracted [ecommerce.zip]<br/>
  &emsp;*`EX: vscode workspace [File>Add folder to workspace...]`*<br/>
  B3: Open TERMINAL or CMD pointing into folder has been extracted to install all packages<br/>
  &emsp;*`EX: cd D:/vscode_workspace/bookish-meme`*<br/>
```
npm install
```
  B4: Execute file database [ecommerce.sql](./ecommerce.sql)<br/>
  B5: configuration username[DB_USER] and password[DB_PASS] to connect to the mssql in [.env](./.env) file<br/>
  B6: Comeback to the TERMINAL or CMD to start server application<br/>
```
npm start
```
[//]: <> (Click to *http://localhost:8080/app* or *http://127.0.0.1:8080/app* to open.)

# function
  - build API and CRUD function,
  - upload files (read, save, delete),
  - connect to database mssql(SQL Server)

# libraries
  - dotenv
  - ejs
  - express
  - fs
  - moment
  - mssql
  - multer
  - nodemon

