/**
*	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++ DATABASE
*	DB_ECOM
*	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++ TABLES
*	USERS & ROLES > AUTHORITIES
*	USERS & CATEGORIES > PRODUCTS > PRODUCT_IMAGES
*	USERS > ORDERS & PRODUCTS > ORDER_DETAILS
*	USERS & PRODUCTS > COMMENTS
*	+++++++++++++++++++++++++++++++++++++++++++++++++++++++++ PROCEDURES
*	USERS > SP_REGISTER | SP_LOGIN
*/

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CREATE DATABASE
-- Connect to the 'master' database to run this snippet
USE master
GO
-- Create a new database called 'DB_ECOM'
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DB_ECOM') DROP DATABASE DB_ECOM
GO
	CREATE DATABASE DB_ECOM;
GO
	USE DB_ECOM
GO

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CREATE TABLES
IF OBJECT_ID('USERS', 'U') IS NULL
CREATE TABLE USERS (
    uid varchar(80) primary key, -- use email
    password binary(70) not null,
    name nvarchar(50) null,
    image varchar(256) default N'default.png', 
    access bit default 1,-- softdelete 0 || 1 allow
    regTime datetime default GETDATE() -- register time
);
GO

IF OBJECT_ID('ROLES', 'U') IS NULL
CREATE TABLE ROLES (
    rid tinyint primary key,
    name nvarchar(50) unique
);
GO

IF OBJECT_ID('AUTHORITIES', 'U') IS NULL
CREATE TABLE AUTHORITIES (
    u_id varchar(80) foreign key references USERS(uid)
	on update cascade on delete cascade not null,
    r_id tinyint foreign key references ROLES(rid)
	on update cascade on delete no action not null,

    regTime datetime default GETDATE(),
    primary key (u_id, r_id)
);
GO

IF OBJECT_ID('CATEGORIES', 'U') IS NULL
CREATE TABLE CATEGORIES (
    cgid varchar(20) primary key,
    name nvarchar(256) not null,
    image varchar(256) default 'default.png',
    note nvarchar(256)
);
GO

IF OBJECT_ID('PRODUCTS', 'U') IS NULL
CREATE TABLE PRODUCTS (
    prid bigint primary key identity,
    subject nvarchar(256) not null,
    note ntext,
    price float not null,
    quantity int not null,
    regTime datetime default GETDATE(),
    access bit default 1, -- softdelete 0 || 1 allow

    u_id varchar(80) foreign key references USERS(uid) 
	on update cascade on delete cascade not null,
    c_id varchar(20) foreign key references CATEGORIES(cgid) 
	on update cascade on delete set null
);
GO

IF OBJECT_ID('PRODUCT_IMAGES', 'U') IS NULL
CREATE TABLE PRODUCT_IMAGES (
    pr_id bigint foreign key references PRODUCTS(prid) 
	on update cascade on delete cascade,

    image nvarchar(256) not null,
    primary key (pr_id, image)
);
GO


IF OBJECT_ID('ORDER_STATUS', 'U') IS NULL
CREATE TABLE ORDER_STATES (
	osid tinyint primary key,
	name nvarchar(256) not null
)

IF OBJECT_ID('ORDERS', 'U') IS NULL
CREATE TABLE ORDERS (
	oid bigint primary key identity,
	regTime datetime default GETDATE(),

	os_id tinyint foreign key references ORDER_STATES(osid) 
	on update cascade on delete no action default 1, -- 1 is the starting state
	u_id varchar(80) foreign key references USERS(uid)
	on update cascade on delete cascade
);
GO

IF OBJECT_ID('ORDER_DETAILS', 'U') IS NULL
CREATE TABLE ORDER_DETAILS (
	quantity int default 1,
	
	pr_id bigint foreign key references PRODUCTS(prid),
	o_id bigint foreign key references ORDERS(oid)
	on update cascade on delete cascade
);
GO

IF OBJECT_ID('COMMENTS', 'U') IS NULL
CREATE TABLE COMMENTS (
    cmid bigint primary key identity,
    regTime datetime default GETDATE(),
    start tinyint default 5,
    comment ntext,
	
    pr_id bigint foreign key references PRODUCTS(prid),
    u_id varchar(80) foreign key references USERS(uid)
	on update cascade on delete cascade
);
GO


-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CREATE TRIGGERS
IF EXISTS (SELECT [object_id] FROM sys.triggers WHERE name = N'TG_ORDER_DETAILS') DROP TRIGGER TG_ORDER_DETAILS
GO
CREATE TRIGGER TG_ORDER_DETAILS ON ORDER_DETAILS
AFTER INSERT AS BEGIN 
	SELECT SUM(quantity) as 'quantity', pr_id INTO # FROM inserted GROUP BY pr_id
	UPDATE pr SET pr.quantity = pr.quantity - #.quantity
	FROM PRODUCTS pr INNER JOIN # ON pr.prid = #.pr_id
END
GO

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CREATE PROCEDURES
IF EXISTS (SELECT [object_id] FROM sys.procedures WHERE name = N'SP_REGISTER') DROP PROC SP_REGISTER
GO
CREATE PROCEDURE SP_REGISTER
	@username varchar(80), @passowrd varchar(256),
	@fullName nvarchar(50), @image varchar(256)
AS BEGIN
	DECLARE @meserror nvarchar(max) 

	IF EXISTS (SELECT uid FROM USERS WHERE uid = @username) BEGIN
		SET @meserror = CONCAT('username: "', @username, '" already exist, cannot register!!!');
		RAISERROR(@meserror, 12, 1);
	END 
	ELSE BEGIN
        INSERT INTO USERS(uid, password, name, image) 
        VALUES (@username, PWDENCRYPT(@passowrd), @fullName, iSNULL(@image, 'default.png'));
        SELECT * FROM USERS WHERE uid = @username;
    END
END
GO

IF EXISTS (SELECT [object_id] FROM sys.procedures WHERE name = N'SP_LOGIN') DROP PROC SP_LOGIN
GO
CREATE PROCEDURE SP_LOGIN
    @username varchar(50),
    @password varchar(256)
AS
BEGIN
	DECLARE @meserror nvarchar(256) = CONCAT (
		'username:', @username, ' and password:', @password, ' is incorrect'
	);

    IF @username is null OR LEN(@password) = 0 RAISERROR('username is empty',15,1);
    IF @password is null OR LEN(@password) = 0 RAISERROR('password is empty',15,1);

    SELECT * INTO #USER FROM USERS 
    WHERE uid = @username and PWDCOMPARE(@password, password) = 1

    IF EXISTS(SELECT uid FROM #USER) SELECT * FROM #USER
    ELSE RAISERROR(@meserror, 12,1);
END
GO

-- +++++++++++++++++++++++++++++++++++++++++++++++++++++++++ INSERT DATA
GO
	DELETE FROM USERS
	DELETE FROM CATEGORIES
	DELETE FROM ROLES
	
	DBCC CHECKIDENT ('COMMENTS', RESEED, 1);
	DBCC CHECKIDENT ('PRODUCTS', RESEED, 1);
	DBCC CHECKIDENT ('ORDERS', RESEED, 1);
GO
INSERT INTO ROLES ([rid], [name]) VALUES
(1, 'OWNER'), (2, 'ADMIN'), (3, 'STAFF'), (4, 'SELLER'), (5, 'USER');

INSERT INTO USERS (uid, password, name, image) VALUES
('owner', PWDENCRYPT('123'), 'Owner System', null),
('admin', PWDENCRYPT('123'), 'Admin System', null),
('staff', PWDENCRYPT('123'), 'Staff System', null),
('seller', PWDENCRYPT('123'), 'Seller System', null),
('user', PWDENCRYPT('123'), 'User System', null);

INSERT INTO AUTHORITIES([u_id], [r_id]) VALUES 
('user', 5), ('seller', 4),
('staff', 3), ('staff', 5),
('admin', 3), ('admin', 4), ('admin', 5),
('owner', 1), ('owner', 2), ('owner', 3), ('owner', 4), ('owner', 5);

INSERT INTO CATEGORIES(cgid, name, image) VALUES
(1, N'Uncategorized', 'https://eyedrsallyslee.com/wp-content/uploads/woocommerce-placeholder.jpg'),
(2, N'Smart phone', 'https://img.freepik.com/free-vector/home-screen-concept-illustration_114360-4703.jpg'),
(3, N'Laptop', 'https://png.pngtree.com/png-vector/20190129/ourlarge/pngtree-vector-laptop-icon-png-image_421169.jpg');

INSERT INTO PRODUCTS (u_id, c_id, quantity, price, subject) VALUES
('owner', 1, 10, 12.1, N'Gopro Hero 11'),
('seller', 2, 20, 30.2, N'Laptop ASUS ZenBook UX482EA-KA111T'),
('admin', 3, 5, 29.8, N'Iphone 14 Pro Max 128GB');

INSERT INTO PRODUCT_IMAGES(pr_id, image) VALUES
(2, 'https://cdn.tgdd.vn/Products/Images/44/251417/Slider/vi-vn-asus-zenbook-ux482ea-i7-ka111t-1.jpg'),
(3, 'https://cdn-img-v2.webbnc.net/uploadv2/web/82/8269/product/2022/09/14/05/57/1663125731_14prm.jpg'),
(3, 'https://stcv4.hnammobile.com/downloads/1/apple-iphone-14-pro-max-128gb-21662790554.jpg');

INSERT INTO COMMENTS(start, pr_id, u_id, comment) VALUES
(5, 1, 'owner',N'Sản phẩm chất lượng, mọi người mua ủng hộ tôi, xin cảm ơn'),
(5, 1, 'seller',N'Sản phẩm tốt như người bán bình luận 🌟🌟🌟🌟🌟'),
(4, 1, 'user',N'Chưa từng mua nhưng cho tạm 4 sao'),

(1, 2, 'user',N'Chiếc laptop quá đắt so với ví tiền của tôi!'),
(5, 2, 'admin',N'Đánh giá ủng hộ lại chủ shop (❁´◡`❁)'),

(5, 3, 'admin',N'Điện thoại ở Bình Dương 🤣'),
(3, 3, 'owner',N'Ước gì có tiền💵 để mua.'),
(5, 3, 'seller',N'Có giá bán bỏ sỉ không, mình muốn mua số lượng.'),
(5, 3, 'staff',N'Điện thoại này có hỗ trợ Tiếng Việt không? có phiên bản khác không🙄'),
(5, 3, 'user',N'Điện thoại cho các Idol du trend TÓp tÓp =))');


INSERT INTO ORDER_STATES(osid, name) VALUES
(1, N'Chuẩn bị'), (2, N'Đang giao dịch'),
(3, N'Đơn hoàn thành'), (4, N'Đã Hủy'), (5, N'Kết thúc')

INSERT INTO ORDERS(u_id) VALUES
('admin'), ('staff'),
('user'), ('user'), ('user')

INSERT INTO ORDER_DETAILS(o_id, pr_id) VALUES 
(1, 1), (1, 2),
(2, 1),
(3, 1), (3, 3),
(4, 2),
(5, 2), (5, 3)
