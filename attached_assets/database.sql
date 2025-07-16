BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "attachments" ("id" integer primary key autoincrement,"template_id" bigint,"content" varchar(255),"type" varchar(255),"name" varchar(255) );
CREATE TABLE IF NOT EXISTS "campaigns" ("id" integer primary key autoincrement,"user_id" bigint,"name" varchar(255) NOT NULL ,"created_date" datetime,"completed_date" datetime,"template_id" bigint,"page_id" bigint,"status" varchar(255),"url" varchar(255) , "smtp_id" bigint, "launch_date" DATETIME, send_by_date DATETIME);
CREATE TABLE IF NOT EXISTS "email_requests" (
    "id" integer primary key autoincrement,
    "user_id" integer,
    "template_id" integer,
    "page_id" integer,
    "first_name" varchar(255),
    "last_name" varchar(255),
    "email" varchar(255),
    "position" varchar(255),
    "url" varchar(255),
    "r_id" varchar(255),
    "from_address" varchar(255)
);
CREATE TABLE IF NOT EXISTS "events" ("id" integer primary key autoincrement,"campaign_id" bigint,"email" varchar(255),"time" datetime,"message" varchar(255) , details BLOB);
CREATE TABLE IF NOT EXISTS goose_db_version (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version_id INTEGER NOT NULL,
                is_applied INTEGER NOT NULL,
                tstamp TIMESTAMP DEFAULT (datetime('now'))
            );
CREATE TABLE IF NOT EXISTS "group_targets" ("group_id" bigint,"target_id" bigint );
CREATE TABLE IF NOT EXISTS "groups" ("id" integer primary key autoincrement,"user_id" bigint,"name" varchar(255),"modified_date" datetime );
CREATE TABLE IF NOT EXISTS headers(
	id integer primary key autoincrement,
	key varchar(255),
	value varchar(255),
	"smtp_id" bigint
);
CREATE TABLE IF NOT EXISTS "imap" ("user_id" bigint, "host" varchar(255), "port" integer, "username" varchar(255), "password" varchar(255), "modified_date" datetime default CURRENT_TIMESTAMP, "tls" BOOLEAN, "enabled" BOOLEAN, "folder" varchar(255), "restrict_domain" varchar(255), "delete_reported_campaign_email" BOOLEAN, "last_login" datetime, "imap_freq" integer, ignore_cert_errors BOOLEAN);
CREATE TABLE IF NOT EXISTS "mail_logs" (
    "id" integer primary key autoincrement,
    "campaign_id" integer,
    "user_id" integer,
    "send_date" datetime,
    "send_attempt" integer,
    "r_id" varchar(255),
    "processing" boolean);
CREATE TABLE IF NOT EXISTS "pages" ("id" integer primary key autoincrement,"user_id" bigint,"name" varchar(255),"html" varchar(255),"modified_date" datetime , capture_credentials BOOLEAN, capture_passwords BOOLEAN, redirect_url VARCHAR(255));
CREATE TABLE IF NOT EXISTS "permissions" (
    "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
    "slug"        VARCHAR(255) NOT NULL UNIQUE,
    "name"        VARCHAR(255) NOT NULL UNIQUE,
    "description" VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS "results" ("id" integer primary key autoincrement,"campaign_id" bigint,"user_id" bigint,"r_id" varchar(255),"email" varchar(255),"first_name" varchar(255),"last_name" varchar(255),"status" varchar(255) NOT NULL ,"ip" varchar(255),"latitude" real,"longitude" real , position VARCHAR(255), send_date DATETIME, reported boolean default 0, modified_date DATETIME);
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "role_id"       INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "roles" (
    "id"          INTEGER PRIMARY KEY AUTOINCREMENT,
    "slug"        VARCHAR(255) NOT NULL UNIQUE,
    "name"        VARCHAR(255) NOT NULL UNIQUE,
    "description" VARCHAR(255)
);
CREATE TABLE IF NOT EXISTS smtp(
	id integer primary key autoincrement,
	user_id bigint,
	interface_type varchar(255),
	name varchar(255),
	host varchar(255),
	username varchar(255),
	password varchar(255),
	from_address varchar(255),
	modified_date datetime default CURRENT_TIMESTAMP,
	ignore_cert_errors BOOLEAN
);
CREATE TABLE IF NOT EXISTS "targets" ("id" integer primary key autoincrement,"first_name" varchar(255),"last_name" varchar(255),"email" varchar(255),"position" varchar(255) );
CREATE TABLE IF NOT EXISTS "templates" ("id" integer primary key autoincrement,"user_id" bigint,"name" varchar(255),"subject" varchar(255),"text" varchar(255),"html" varchar(255),"modified_date" datetime , envelope_sender varchar(255));
CREATE TABLE IF NOT EXISTS "users" ("id" integer primary key autoincrement,"username" varchar(255) NOT NULL UNIQUE,"hash" varchar(255),"api_key" varchar(255) NOT NULL UNIQUE , "role_id" INTEGER, password_change_required BOOLEAN, last_login datetime, account_locked BOOLEAN);
CREATE TABLE IF NOT EXISTS "webhooks" (
    "id" integer primary key autoincrement,
    "name" varchar(255),
    "url" varchar(1000),
    "secret" varchar(255),
    "is_active" boolean default 0
);
INSERT INTO "goose_db_version" ("id","version_id","is_applied","tstamp") VALUES (1,0,1,'2025-04-22 13:09:31'),
 (2,20160118194630,1,'2025-04-22 13:09:31'),
 (3,20160131153104,1,'2025-04-22 13:09:31'),
 (4,20160211211220,1,'2025-04-22 13:09:31'),
 (5,20160217211342,1,'2025-04-22 13:09:31'),
 (6,20160225173824,1,'2025-04-22 13:09:31'),
 (7,20160227180335,1,'2025-04-22 13:09:31'),
 (8,20160317214457,1,'2025-04-22 13:09:31'),
 (9,20160605210903,1,'2025-04-22 13:09:31'),
 (10,20170104220731,1,'2025-04-22 13:09:31'),
 (11,20170219122503,1,'2025-04-22 13:09:31'),
 (12,20170827141312,1,'2025-04-22 13:09:31'),
 (13,20171027213457,1,'2025-04-22 13:09:31'),
 (14,20171208201932,1,'2025-04-22 13:09:31'),
 (15,20180223101813,1,'2025-04-22 13:09:31'),
 (16,20180524203752,1,'2025-04-22 13:09:31'),
 (17,20180527213648,1,'2025-04-22 13:09:31'),
 (18,20180830215615,1,'2025-04-22 13:09:31'),
 (19,20190105192341,1,'2025-04-22 13:09:31'),
 (20,20191104103306,1,'2025-04-22 13:09:31'),
 (21,20200116000000,1,'2025-04-22 13:09:31'),
 (22,20200619000000,1,'2025-04-22 13:09:31'),
 (23,20200730000000,1,'2025-04-22 13:09:31'),
 (24,20200914000000,1,'2025-04-22 13:09:31'),
 (25,20201201000000,1,'2025-04-22 13:09:31'),
 (26,20220321133237,1,'2025-04-22 13:09:31');
INSERT INTO "permissions" ("id","slug","name","description") VALUES (1,'view_objects','View Objects','View objects in Gophish'),
 (2,'modify_objects','Modify Objects','Create and edit objects in Gophish'),
 (3,'modify_system','Modify System','Manage system-wide configuration');
INSERT INTO "role_permissions" ("role_id","permission_id") VALUES (1,1),
 (2,1),
 (1,2),
 (2,2),
 (1,3);
INSERT INTO "roles" ("id","slug","name","description") VALUES (1,'admin','Admin','System administrator with full permissions'),
 (2,'user','User','User role with edit access to objects and campaigns');
INSERT INTO "templates" ("id","user_id","name","subject","text","html","modified_date","envelope_sender") VALUES (1,1,'test','mhgjhgvhjg','','<html>
<head>
	<title></title>
</head>
<body>
<p>&lt;html&gt;<br />
&lt;head&gt;<br />
&nbsp; &lt;link rel=&quot;stylesheet&quot; href=&quot;https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css&quot;&gt;<br />
&lt;/head&gt;<br />
&lt;body&gt;<br />
&lt;h1 style=&quot;color:#4472c4&quot;&gt;Microsoft Account&lt;/h1&gt;<br />
&lt;p&gt;Dear {{.FirstName}},&lt;/p&gt;<br />
&lt;p&gt;Someone in Bogot&aacute; Colombia attempted to log into your account several times. If you believe this was fraudulent activity please report it &lt;a href={{.URL}}&gt;here&lt;/a&gt;.&lt;/p&gt;<br />
&lt;p&gt;If you do not believe this to be fraudulent activity you may ignore this message&lt;/p&gt;&lt;br&gt;<br />
&lt;p&gt;Sincerely,&lt;/p&gt;<br />
&lt;p&gt;Office365 @ COMPANY.com&lt;/p&gt;<br />
&lt;/body&gt;<br />
&lt;/html&gt;</p>
{{.Tracker}}</body>
</html>
','2025-05-04 09:42:58.2319388+00:00','test@example.com'),
 (2,1,'dqtmpez','mhgjhgvhjg','','<html>
<head>
	<title></title>
</head>
<body>
<p>&lt;html&gt;<br />
&lt;head&gt;<br />
&nbsp; &lt;link rel=&quot;stylesheet&quot; href=&quot;https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css&quot;&gt;<br />
&lt;/head&gt;<br />
&lt;body&gt;<br />
&lt;h1 style=&quot;color:#4472c4&quot;&gt;Microsoft Account&lt;/h1&gt;<br />
&lt;p&gt;Dear {{.FirstName}},&lt;/p&gt;<br />
&lt;p&gt;Someone in Bogot&aacute; Colombia attempted to log into your account several times. If you believe this was fraudulent activity please report it &lt;a href={{.URL}}&gt;here&lt;/a&gt;.&lt;/p&gt;<br />
&lt;p&gt;If you do not believe this to be fraudulent activity you may ignore this message&lt;/p&gt;&lt;br&gt;<br />
&lt;p&gt;Sincerely,&lt;/p&gt;<br />
&lt;p&gt;Office365 @ COMPANY.com&lt;/p&gt;<br />
&lt;/body&gt;<br />
&lt;/html&gt;</p>
{{.Tracker}}</body>
</html>
','2025-05-04 09:43:54.3269775+00:00','test@example.com');
INSERT INTO "users" ("id","username","hash","api_key","role_id","password_change_required","last_login","account_locked") VALUES (1,'admin','$2a$10$338VzCTz1OXbzp5THgWSgeEiiY8QAvriQ08.GpuDe.ASk1pV/u24a','97b2d2f6125061ee0fa2cb805084239c9782ae4ff573155a2d53c84790cd10fd',1,0,'2025-05-04 09:40:35.8195799+00:00',0),
 (2,'user','$2a$10$TYJ0RsEbUKyAAPhhzesD3.E0RNDigWBKK..khUYShz1Pu1nac.x3C','de5ed5c501a50497b42ab16e00e7059b760cefceabd0b832e82121897c1c61ac',2,0,'0001-01-01 00:00:00+00:00',0);
COMMIT;
