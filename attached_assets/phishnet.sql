--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: campaign_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_results (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    target_id integer NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    sent_at timestamp without time zone,
    opened boolean DEFAULT false NOT NULL,
    opened_at timestamp without time zone,
    clicked boolean DEFAULT false NOT NULL,
    clicked_at timestamp without time zone,
    submitted boolean DEFAULT false NOT NULL,
    submitted_at timestamp without time zone,
    submitted_data jsonb,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL
);


ALTER TABLE public.campaign_results OWNER TO postgres;

--
-- Name: campaign_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_results_id_seq OWNER TO postgres;

--
-- Name: campaign_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_results_id_seq OWNED BY public.campaign_results.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'Draft'::text NOT NULL,
    target_group_id integer NOT NULL,
    smtp_profile_id integer NOT NULL,
    email_template_id integer NOT NULL,
    landing_page_id integer NOT NULL,
    scheduled_at timestamp without time zone,
    end_date timestamp without time zone,
    created_by_id integer NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_templates (
    id integer NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    html_content text NOT NULL,
    text_content text,
    sender_name text NOT NULL,
    sender_email text NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by_id integer,
    type text DEFAULT 'phishing-business'::text,
    complexity text DEFAULT 'medium'::text,
    description text,
    category text
);


ALTER TABLE public.email_templates OWNER TO postgres;

--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_templates_id_seq OWNER TO postgres;

--
-- Name: email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_templates_id_seq OWNED BY public.email_templates.id;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- Name: COLUMN groups.organization_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.groups.organization_id IS 'comment';


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.groups_id_seq OWNER TO postgres;

--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: landing_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landing_pages (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    html_content text NOT NULL,
    redirect_url text,
    page_type text NOT NULL,
    thumbnail text,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by_id integer
);


ALTER TABLE public.landing_pages OWNER TO postgres;

--
-- Name: landing_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landing_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.landing_pages_id_seq OWNER TO postgres;

--
-- Name: landing_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landing_pages_id_seq OWNED BY public.landing_pages.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    id integer NOT NULL,
    user_id integer,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    campaign_alerts boolean DEFAULT true,
    security_alerts boolean DEFAULT true,
    system_updates boolean DEFAULT true,
    weekly_reports boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_preferences_id_seq OWNER TO postgres;

--
-- Name: notification_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_preferences_id_seq OWNED BY public.notification_preferences.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    organization_id integer,
    type character varying(50) NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    priority character varying(20) DEFAULT 'medium'::character varying,
    action_url character varying(500),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    read_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: organization_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization_settings (
    id integer NOT NULL,
    organization_id integer NOT NULL,
    logo_url text,
    theme jsonb,
    settings jsonb
);


ALTER TABLE public.organization_settings OWNER TO postgres;

--
-- Name: organization_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organization_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organization_settings_id_seq OWNER TO postgres;

--
-- Name: organization_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organization_settings_id_seq OWNED BY public.organization_settings.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    industry text,
    address text,
    logo_url text,
    settings jsonb
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organizations_id_seq OWNER TO postgres;

--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: smtp_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.smtp_profiles (
    id integer NOT NULL,
    name text NOT NULL,
    host text NOT NULL,
    port integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    from_name text NOT NULL,
    from_email text NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.smtp_profiles OWNER TO postgres;

--
-- Name: smtp_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.smtp_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.smtp_profiles_id_seq OWNER TO postgres;

--
-- Name: smtp_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.smtp_profiles_id_seq OWNED BY public.smtp_profiles.id;


--
-- Name: targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.targets (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    "position" text,
    group_id integer NOT NULL,
    organization_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    department text
);


ALTER TABLE public.targets OWNER TO postgres;

--
-- Name: targets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.targets_id_seq OWNER TO postgres;

--
-- Name: targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.targets_id_seq OWNED BY public.targets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    profile_picture text,
    "position" text,
    bio text,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    last_failed_login timestamp without time zone,
    account_locked boolean DEFAULT false NOT NULL,
    account_locked_until timestamp without time zone,
    is_admin boolean DEFAULT false NOT NULL,
    organization_id integer NOT NULL,
    organization_name text DEFAULT 'None'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: campaign_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results ALTER COLUMN id SET DEFAULT nextval('public.campaign_results_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: email_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates ALTER COLUMN id SET DEFAULT nextval('public.email_templates_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: landing_pages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages ALTER COLUMN id SET DEFAULT nextval('public.landing_pages_id_seq'::regclass);


--
-- Name: notification_preferences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN id SET DEFAULT nextval('public.notification_preferences_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: organization_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_settings ALTER COLUMN id SET DEFAULT nextval('public.organization_settings_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: smtp_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smtp_profiles ALTER COLUMN id SET DEFAULT nextval('public.smtp_profiles_id_seq'::regclass);


--
-- Name: targets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets ALTER COLUMN id SET DEFAULT nextval('public.targets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: campaign_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_results (id, campaign_id, target_id, sent, sent_at, opened, opened_at, clicked, clicked_at, submitted, submitted_at, submitted_data, organization_id, created_at, updated_at, status) FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, name, status, target_group_id, smtp_profile_id, email_template_id, landing_page_id, scheduled_at, end_date, created_by_id, organization_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_templates (id, name, subject, html_content, text_content, sender_name, sender_email, organization_id, created_at, updated_at, created_by_id, type, complexity, description, category) FROM stdin;
4	PhishNet1	mhgjhgvhjg	<p>&nbsp;</p><div class="se-component se-image-container __se__float-"><figure style="width: 120px;"><img alt="" src="https://www.underconsideration.com/brandnew/archives/dropbox_2017_logo.png" data-proportion="true" data-align="" data-file-name="dropbox_2017_logo.png" data-file-size="0" data-origin="120px,27px" data-size="120px,27px" style="width: 120px; height: 27px;"></figure></div><p>&nbsp;</p><p>Hi {{.FirstName}},</p><p>You have a new document/s shared to you via dropbox sharing.</p><p><a href="{{.URL}}">VIEW HERE</a></p><p>&nbsp;</p><p>&nbsp;</p><p>{{.Tracker}}</p>	\N	PhishNet Team	phishing@example.com	1	2025-05-04 12:34:32.076	2025-05-04 12:34:32.076	1	phishing-business	medium	Standard phishing template	business
13	PhishNet	Important Bulletin Alert	<h3>WebMail Account</h3><h1>Your mailbox has been compromised</h1><p>Your webmail account has been compromised.</p><p>We have blocked your account for your own safety.</p><p>Please follow these steps below to sign in and keep your account safe:</p><ol><li><a href="{{.URL}}">Protect your account</a></li><li>Learn how to <a href="{{.URL}}">make your account more secure</a></li></ol><p>To opt out or change where you receive security notifications, <a href="{{.URL}}">click here</a></p><p>Thanks,</p><p>Webmail account team</p>	\N	PhishNet Team	phishing@example.com	2	2025-06-24 16:13:10.045986	2025-07-01 19:27:30.333	11	phishing-business	medium	Standard phishing template	business
5	medium	mhgjhgvhjg	<p style="margin-left:13.5pt">Hi {{.FirstName}},<br><br>Your package arrived at the post office. Here is your Shipping Document/Invoice and copy of DHL receipt for your tracking which includes the bill of lading and DHL tracking number, the new Import/Export policy supplied by DHL Express. Please kindly check the attached to confirm accordingly if your address is correct, before we submit to our outlet office for dispatch to your destination.</p><p style="margin-left:13.5pt"><strong>Label Number: E727D5151D<br>Class: Package Services<br>Service(s): Delivery Confirmation<br>Status: eNotification sent</strong></p><p><a href="{{.URL}}">View or download here</a> for the full statement information and a full description of package.</p><p style="margin-left:13.5pt">Your item will arrive from 2-5 days time.<br>We would like to thank you for using the services of DHL Express.<br>&nbsp;</p><p style="margin-left:13.7pt">{{.Tracker}}</p>	\N	PhishNet Team	phishing@example.com	1	2025-05-04 13:20:31.354	2025-05-04 13:20:31.354	1	phishing-business	medium	Standard phishing template	business
6	test	mhgjhgvhjg	<p style="margin-left:13.5pt">Dear FDIC Customer,<br><br>The Federal Deposit Insurance Corporation Online department kindly asks you to take part in our quick and easy 5 questions survey.<br><br>In return we will credit $50.00 to your account - Just for your time!<br><br>With the information collected we can decide to direct a number of changes to improve and expand our services. The information you provide us is all non-sensitive and anonymous - No part of it is handed down to any third party.<br><br>It will be stored in our secure database for maximum 7 days while we process the results of this nationwide survey.<br><br>We kindly ask you to spare two minutes of your time and take part in our online survey.<br><br>To continue please click on the following link :</p><p style="margin-left:13.5pt">&nbsp;</p><p style="margin-left:13.5pt"><a href="{{.URL}}">http://important.fdic-survey.net/survey/fdic/login.html</a></p><p style="margin-left:13.5pt">&nbsp;</p><p style="margin-left:13.7pt">{{.Tracker}}</p><p style="margin-left:13.5pt">&nbsp;</p>	\N	PhishNet Team	phishing@example.com	1	2025-05-06 01:38:31.158	2025-05-06 01:38:31.158	1	phishing-business	medium	Standard phishing template	business
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, description, organization_id, created_at, updated_at) FROM stdin;
1	testrt	test	1	2025-04-30 02:44:59.253	2025-05-01 02:09:25.906
2	test2	test	1	2025-04-30 02:57:03.932	2025-04-30 02:57:03.932
8	PhishNet		2	2025-07-06 17:11:35.405646	2025-07-06 17:11:35.405646
\.


--
-- Data for Name: landing_pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.landing_pages (id, name, description, html_content, redirect_url, page_type, thumbnail, organization_id, created_at, updated_at, created_by_id) FROM stdin;
1	test	jkhekf	<div></div>		login	\N	2	2025-06-24 11:43:20.810054	2025-06-24 11:43:20.810054	11
2	Riphah International University: Log in to the site	sda	<!DOCTYPE html>\n\n<html  dir="ltr" lang="en" xml:lang="en">\n<head>\n    <title>Riphah International University: Log in to the site</title>\n    <link rel="shortcut icon" href="https://moellim.riphah.edu.pk/theme/image.php/classic/theme/1746215662/favicon" />\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n<meta name="keywords" content="moodle, Riphah International University: Log in to the site" />\n<link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.css" /><script id="firstthemesheet" type="text/css">/** Required in order to fix style inclusion problems in IE with YUI **/</script><link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/styles.php/classic/1746215662_1/all" />\n<script type="text/javascript">\n//<![CDATA[\nvar M = {}; M.yui = {};\nM.pageloadstarttime = new Date();\nM.cfg = {"wwwroot":"https:\\/\\/moellim.riphah.edu.pk","sesskey":"ITdb5hXJeA","sessiontimeout":"1800","themerev":"1746215662","slasharguments":1,"theme":"classic","iconsystemmodule":"core\\/icon_system_fontawesome","jsrev":"1745292882","admin":"admin","svgicons":true,"usertimezone":"Asia\\/Karachi","contextid":1,"langrev":1745292882,"templaterev":"1745292882"};var yui1ConfigFn = function(me) {if(/-skin|reset|fonts|grids|base/.test(me.name)){me.type='css';me.path=me.path.replace(/\\.js/,'.css');me.path=me.path.replace(/\\/yui2-skin/,'/assets/skins/sam/yui2-skin')}};\nvar yui2ConfigFn = function(me) {var parts=me.name.replace(/^moodle-/,'').split('-'),component=parts.shift(),module=parts[0],min='-min';if(/-(skin|core)$/.test(me.name)){parts.pop();me.type='css';min=''}\nif(module){var filename=parts.join('-');me.path=component+'/'+module+'/'+filename+min+'.'+me.type}else{me.path=component+'/'+component+'.'+me.type}};\nYUI_config = {"debug":false,"base":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/yuilib\\/3.17.2\\/","comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","combine":true,"filter":null,"insertBefore":"firstthemesheet","groups":{"yui2":{"base":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/yuilib\\/2in3\\/2.9.0\\/build\\/","comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","combine":true,"ext":false,"root":"2in3\\/2.9.0\\/build\\/","patterns":{"yui2-":{"group":"yui2","configFn":yui1ConfigFn}}},"moodle":{"name":"moodle","base":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?m\\/1745292882\\/","combine":true,"comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","ext":false,"root":"m\\/1745292882\\/","patterns":{"moodle-":{"group":"moodle","configFn":yui2ConfigFn}},"filter":null,"modules":{"moodle-core-actionmenu":{"requires":["base","event","node-event-simulate"]},"moodle-core-dragdrop":{"requires":["base","node","io","dom","dd","event-key","event-focus","moodle-core-notification"]},"moodle-core-popuphelp":{"requires":["moodle-core-tooltip"]},"moodle-core-notification":{"requires":["moodle-core-notification-dialogue","moodle-core-notification-alert","moodle-core-notification-confirm","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-core-notification-dialogue":{"requires":["base","node","panel","escape","event-key","dd-plugin","moodle-core-widget-focusafterclose","moodle-core-lockscroll"]},"moodle-core-notification-alert":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-confirm":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-exception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-ajaxexception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-languninstallconfirm":{"requires":["base","node","moodle-core-notification-confirm","moodle-core-notification-alert"]},"moodle-core-tooltip":{"requires":["base","node","io-base","moodle-core-notification-dialogue","json-parse","widget-position","widget-position-align","event-outside","cache-base"]},"moodle-core-maintenancemodetimer":{"requires":["base","node"]},"moodle-core-event":{"requires":["event-custom"]},"moodle-core-handlebars":{"condition":{"trigger":"handlebars","when":"after"}},"moodle-core-lockscroll":{"requires":["plugin","base-build"]},"moodle-core-formchangechecker":{"requires":["base","event-focus","moodle-core-event"]},"moodle-core-blocks":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification"]},"moodle-core-chooserdialogue":{"requires":["base","panel","moodle-core-notification"]},"moodle-core_availability-form":{"requires":["base","node","event","event-delegate","panel","moodle-core-notification-dialogue","json"]},"moodle-backup-confirmcancel":{"requires":["node","node-event-simulate","moodle-core-notification-confirm"]},"moodle-backup-backupselectall":{"requires":["node","event","node-event-simulate","anim"]},"moodle-course-formatchooser":{"requires":["base","node","node-event-simulate"]},"moodle-course-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-course-coursebase","moodle-course-util"]},"moodle-course-categoryexpander":{"requires":["node","event-key"]},"moodle-course-modchooser":{"requires":["moodle-core-chooserdialogue","moodle-course-coursebase"]},"moodle-course-management":{"requires":["base","node","io-base","moodle-core-notification-exception","json-parse","dd-constrain","dd-proxy","dd-drop","dd-delegate","node-event-delegate"]},"moodle-course-util":{"requires":["node"],"use":["moodle-course-util-base"],"submodules":{"moodle-course-util-base":{},"moodle-course-util-section":{"requires":["node","moodle-course-util-base"]},"moodle-course-util-cm":{"requires":["node","moodle-course-util-base"]}}},"moodle-form-shortforms":{"requires":["node","base","selector-css3","moodle-core-event"]},"moodle-form-dateselector":{"requires":["base","node","overlay","calendar"]},"moodle-form-passwordunmask":{"requires":[]},"moodle-question-chooser":{"requires":["moodle-core-chooserdialogue"]},"moodle-question-preview":{"requires":["base","dom","event-delegate","event-key","core_question_engine"]},"moodle-question-searchform":{"requires":["base","node"]},"moodle-availability_completion-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_date-form":{"requires":["base","node","event","io","moodle-core_availability-form"]},"moodle-availability_grade-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_group-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_grouping-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_profile-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-mod_assign-history":{"requires":["node","transition"]},"moodle-mod_attendance-groupfilter":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-rooms":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-imports":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-modform":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-broker":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-recordings":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_quiz-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-base","moodle-mod_quiz-util-page","moodle-mod_quiz-util-slot","moodle-course-util"]},"moodle-mod_quiz-autosave":{"requires":["base","node","event","event-valuechange","node-event-delegate","io-form"]},"moodle-mod_quiz-util":{"requires":["node","moodle-core-actionmenu"],"use":["moodle-mod_quiz-util-base"],"submodules":{"moodle-mod_quiz-util-base":{},"moodle-mod_quiz-util-slot":{"requires":["node","moodle-mod_quiz-util-base"]},"moodle-mod_quiz-util-page":{"requires":["node","moodle-mod_quiz-util-base"]}}},"moodle-mod_quiz-quizbase":{"requires":["base","node"]},"moodle-mod_quiz-modform":{"requires":["base","node","event"]},"moodle-mod_quiz-toolboxes":{"requires":["base","node","event","event-key","io","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-slot","moodle-core-notification-ajaxexception"]},"moodle-mod_quiz-questionchooser":{"requires":["moodle-core-chooserdialogue","moodle-mod_quiz-util","querystring-parse"]},"moodle-message_airnotifier-toolboxes":{"requires":["base","node","io"]},"moodle-filter_glossary-autolinker":{"requires":["base","node","io-base","json-parse","event-delegate","overlay","moodle-core-event","moodle-core-notification-alert","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-filter_mathjaxloader-loader":{"requires":["moodle-core-event"]},"moodle-editor_atto-editor":{"requires":["node","transition","io","overlay","escape","event","event-simulate","event-custom","node-event-html5","node-event-simulate","yui-throttle","moodle-core-notification-dialogue","moodle-core-notification-confirm","moodle-editor_atto-rangy","handlebars","timers","querystring-stringify"]},"moodle-editor_atto-plugin":{"requires":["node","base","escape","event","event-outside","handlebars","event-custom","timers","moodle-editor_atto-menu"]},"moodle-editor_atto-menu":{"requires":["moodle-core-notification-dialogue","node","event","event-custom"]},"moodle-editor_atto-rangy":{"requires":[]},"moodle-report_eventlist-eventfilter":{"requires":["base","event","node","node-event-delegate","datatable","autocomplete","autocomplete-filters"]},"moodle-report_loglive-fetchlogs":{"requires":["base","event","node","io","node-event-delegate"]},"moodle-gradereport_grader-gradereporttable":{"requires":["base","node","event","handlebars","overlay","event-hover"]},"moodle-gradereport_history-userselector":{"requires":["escape","event-delegate","event-key","handlebars","io-base","json-parse","moodle-core-notification-dialogue"]},"moodle-tool_capability-search":{"requires":["base","node"]},"moodle-tool_lp-dragdrop-reorder":{"requires":["moodle-core-dragdrop"]},"moodle-tool_monitor-dropdown":{"requires":["base","event","node"]},"moodle-assignfeedback_editpdf-editor":{"requires":["base","event","node","io","graphics","json","event-move","event-resize","transition","querystring-stringify-simple","moodle-core-notification-dialog","moodle-core-notification-alert","moodle-core-notification-warning","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-atto_accessibilitychecker-button":{"requires":["color-base","moodle-editor_atto-plugin"]},"moodle-atto_accessibilityhelper-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_align-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_bold-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_charmap-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_clear-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_collapse-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emojipicker-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emoticon-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_equation-button":{"requires":["moodle-editor_atto-plugin","moodle-core-event","io","event-valuechange","tabview","array-extras"]},"moodle-atto_h5p-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_html-codemirror":{"requires":["moodle-atto_html-codemirror-skin"]},"moodle-atto_html-beautify":{},"moodle-atto_html-button":{"requires":["promise","moodle-editor_atto-plugin","moodle-atto_html-beautify","moodle-atto_html-codemirror","event-valuechange"]},"moodle-atto_image-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_indent-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_italic-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_link-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_managefiles-usedfiles":{"requires":["node","escape"]},"moodle-atto_managefiles-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_media-button":{"requires":["moodle-editor_atto-plugin","moodle-form-shortforms"]},"moodle-atto_noautolink-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_orderedlist-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_recordrtc-recording":{"requires":["moodle-atto_recordrtc-button"]},"moodle-atto_recordrtc-button":{"requires":["moodle-editor_atto-plugin","moodle-atto_recordrtc-recording"]},"moodle-atto_rtl-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_snippet-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_strike-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_subscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_superscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_table-button":{"requires":["moodle-editor_atto-plugin","moodle-editor_atto-menu","event","event-valuechange"]},"moodle-atto_title-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_underline-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_undo-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_unorderedlist-button":{"requires":["moodle-editor_atto-plugin"]}}},"gallery":{"name":"gallery","base":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/yuilib\\/gallery\\/","combine":true,"comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","ext":false,"root":"gallery\\/1745292882\\/","patterns":{"gallery-":{"group":"gallery"}}}},"modules":{"core_filepicker":{"name":"core_filepicker","fullpath":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/javascript.php\\/1745292882\\/repository\\/filepicker.js","requires":["base","node","node-event-simulate","json","async-queue","io-base","io-upload-iframe","io-form","yui2-treeview","panel","cookie","datatable","datatable-sort","resize-plugin","dd-plugin","escape","moodle-core_filepicker","moodle-core-notification-dialogue"]},"core_comment":{"name":"core_comment","fullpath":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/javascript.php\\/1745292882\\/comment\\/comment.js","requires":["base","io-base","node","json","yui2-animation","overlay","escape"]},"mathjax":{"name":"mathjax","fullpath":"https:\\/\\/cdnjs.cloudflare.com\\/ajax\\/libs\\/mathjax\\/2.7.2\\/MathJax.js?delayStartupUntil=configured"}}};\nM.yui.loader = {modules: {}};\n\n//]]>\n</script>\n\n<!-- Global site tag (gtag.js) - Google Analytics -->\r\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-N3MDL6BKSN"></script>\r\n<script>\r\n  window.dataLayer = window.dataLayer || [];\r\n  function gtag(){dataLayer.push(arguments);}\r\n  gtag('js', new Date());\r\n\r\n  gtag('config', 'G-N3MDL6BKSN');\r\n</script><meta name="robots" content="noindex" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body  id="page-login-index" class="format-site  path-login chrome dir-ltr lang-en yui-skin-sam yui3-skin-sam moellim-riphah-edu-pk pagelayout-login course-1 context-1 notloggedin ">\n<div class="toast-wrapper mx-auto py-3 fixed-top" role="status" aria-live="polite"></div>\n\n<div id="page-wrapper">\n\n    <div>\n    <a class="sr-only sr-only-focusable" href="#maincontent">Skip to main content</a>\n</div><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/babel-polyfill/polyfill.min.js"></script>\n<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/mdn-polyfills/polyfill.js"></script>\n<script type="text/javascript" src="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.js"></script><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/javascript-static.js"></script>\n<script type="text/javascript">\n//<![CDATA[\ndocument.body.className += ' jsenabled';\n//]]>\n</script>\n\n\n\n    <div id="page" class="container-fluid mt-0">\n        <div id="page-content" class="row">\n            <div id="region-main-box" class="col-12">\n                <section id="region-main" class="col-12" aria-label="Content">\n                    <span class="notifications" id="user-notifications"></span>\n                    <div role="main"><span id="maincontent"></span><div class="my-1 my-sm-5"></div>\n<div class="row justify-content-center">\n<div class="col-xl-6 col-sm-8 ">\n<div class="card">\n    <div class="card-block">\n            <h2 class="card-header text-center" ><img src="https://moellim.riphah.edu.pk/pluginfile.php/1/core_admin/logo/0x200/1746215662/logo%20%281%29.png" class="img-fluid" title="Riphah International University" alt="Riphah International University"/></h2>\n        <div class="card-body">\n\n\n            <div class="row justify-content-md-center">\n                <div class="col-md-5">\n                    <form class="mt-3" action="https://moellim.riphah.edu.pk/login/index.php" method="post" id="login">\n                        <input id="anchor" type="hidden" name="anchor" value="">\n                        <script>document.getElementById('anchor').value = location.hash;</script>\n                        <input type="hidden" name="logintoken" value="vo3UJeotPlVZLL0bJ9Vb8nYF9owjbYIc">\n                        <div class="form-group">\n                            <label for="username" class="sr-only">\n                                    Username\n                            </label>\n                            <input type="text" name="username" id="username"\n                                class="form-control"\n                                value=""\n                                placeholder="Username"\n                                autocomplete="username">\n                        </div>\n                        <div class="form-group">\n                            <label for="password" class="sr-only">Password</label>\n                            <input type="password" name="password" id="password" value=""\n                                class="form-control"\n                                placeholder="Password"\n                                autocomplete="current-password">\n                        </div>\n                            <div class="rememberpass mt-3">\n                                <input type="checkbox" name="rememberusername" id="rememberusername" value="1"  />\n                                <label for="rememberusername">Remember username</label>\n                            </div>\n\n                        <button type="submit" class="btn btn-primary btn-block mt-3" id="loginbtn">Log in</button>\n                    </form>\n                </div>\n\n                <div class="col-md-5">\n                    <div class="forgetpass mt-3">\n                        <p><a href="https://moellim.riphah.edu.pk/login/forgot_password.php">Forgotten your username or password?</a></p>\n                    </div>\n\n                    <div class="mt-3">\n                        Cookies must be enabled in your browser\n                        <a class="btn btn-link p-0" role="button"\n    data-container="body" data-toggle="popover"\n    data-placement="right" data-content="&lt;div class=&quot;no-overflow&quot;&gt;&lt;p&gt;Two cookies are used on this site:&lt;/p&gt;\n\n&lt;p&gt;The essential one is the session cookie, usually called MoodleSession. You must allow this cookie in your browser to provide continuity and to remain logged in when browsing the site. When you log out or close the browser, this cookie is destroyed (in your browser and on the server).&lt;/p&gt;\n\n&lt;p&gt;The other cookie is purely for convenience, usually called MOODLEID or similar. It just remembers your username in the browser. This means that when you return to this site, the username field on the login page is already filled in for you. It is safe to refuse this cookie - you will just have to retype your username each time you log in.&lt;/p&gt;\n&lt;/div&gt; "\n    data-html="true" tabindex="0" data-trigger="focus">\n  <i class="icon fa fa-question-circle text-info fa-fw "  title="Help with Cookies must be enabled in your browser" aria-label="Help with Cookies must be enabled in your browser"></i>\n</a>\n                    </div>\n\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n</div>\n</div></div>\n                    \n                </section>\n            </div>\n        </div>\n    </div>\n    <footer id="page-footer" class="py-3 bg-dark text-light">\n        <div class="container">\n            <div id="course-footer"></div>\n\n\n            <div class="logininfo">You are not logged in.</div>\n            <div class="homelink"><a href="https://moellim.riphah.edu.pk/">Home</a></div>\n            \n            <script type="text/javascript">\n//<![CDATA[\nvar require = {\n    baseUrl : 'https://moellim.riphah.edu.pk/lib/requirejs.php/1745292882/',\n    // We only support AMD modules with an explicit define() statement.\n    enforceDefine: true,\n    skipDataMain: true,\n    waitSeconds : 0,\n\n    paths: {\n        jquery: 'https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/jquery-3.4.1.min',\n        jqueryui: 'https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/ui-1.12.1/jquery-ui.min',\n        jqueryprivate: 'https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/jquery-private'\n    },\n\n    // Custom jquery config map.\n    map: {\n      // '*' means all modules will get 'jqueryprivate'\n      // for their 'jquery' dependency.\n      '*': { jquery: 'jqueryprivate' },\n      // Stub module for 'process'. This is a workaround for a bug in MathJax (see MDL-60458).\n      '*': { process: 'core/first' },\n\n      // 'jquery-private' wants the real jQuery module\n      // though. If this line was not here, there would\n      // be an unresolvable cyclic dependency.\n      jqueryprivate: { jquery: 'jquery' }\n    }\n};\n\n//]]>\n</script>\n<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/require.min.js"></script>\n<script type="text/javascript">\n//<![CDATA[\nM.util.js_pending("core/first");require(['core/first'], function() {\n;\nrequire(["media_videojs/loader"], function(loader) {\n    loader.setUp(function(videojs) {\n        videojs.options.flash.swf = "https://moellim.riphah.edu.pk/media/player/videojs/videojs/video-js.swf";\nvideojs.addLanguage('en', {\n  "Audio Player": "Audio Player",\n  "Video Player": "Video Player",\n  "Play": "Play",\n  "Pause": "Pause",\n  "Replay": "Replay",\n  "Current Time": "Current Time",\n  "Duration": "Duration",\n  "Remaining Time": "Remaining Time",\n  "Stream Type": "Stream Type",\n  "LIVE": "LIVE",\n  "Seek to live, currently behind live": "Seek to live, currently behind live",\n  "Seek to live, currently playing live": "Seek to live, currently playing live",\n  "Loaded": "Loaded",\n  "Progress": "Progress",\n  "Progress Bar": "Progress Bar",\n  "progress bar timing: currentTime={1} duration={2}": "{1} of {2}",\n  "Fullscreen": "Fullscreen",\n  "Non-Fullscreen": "Non-Fullscreen",\n  "Mute": "Mute",\n  "Unmute": "Unmute",\n  "Playback Rate": "Playback Rate",\n  "Subtitles": "Subtitles",\n  "subtitles off": "subtitles off",\n  "Captions": "Captions",\n  "captions off": "captions off",\n  "Chapters": "Chapters",\n  "Descriptions": "Descriptions",\n  "descriptions off": "descriptions off",\n  "Audio Track": "Audio Track",\n  "Volume Level": "Volume Level",\n  "You aborted the media playback": "You aborted the media playback",\n  "A network error caused the media download to fail part-way.": "A network error caused the media download to fail part-way.",\n  "The media could not be loaded, either because the server or network failed or because the format is not supported.": "The media could not be loaded, either because the server or network failed or because the format is not supported.",\n  "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",\n  "No compatible source was found for this media.": "No compatible source was found for this media.",\n  "The media is encrypted and we do not have the keys to decrypt it.": "The media is encrypted and we do not have the keys to decrypt it.",\n  "Play Video": "Play Video",\n  "Close": "Close",\n  "Close Modal Dialog": "Close Modal Dialog",\n  "Modal Window": "Modal Window",\n  "This is a modal window": "This is a modal window",\n  "This modal can be closed by pressing the Escape key or activating the close button.": "This modal can be closed by pressing the Escape key or activating the close button.",\n  ", opens captions settings dialog": ", opens captions settings dialog",\n  ", opens subtitles settings dialog": ", opens subtitles settings dialog",\n  ", opens descriptions settings dialog": ", opens descriptions settings dialog",\n  ", selected": ", selected",\n  "captions settings": "captions settings",\n  "subtitles settings": "subititles settings",\n  "descriptions settings": "descriptions settings",\n  "Text": "Text",\n  "White": "White",\n  "Black": "Black",\n  "Red": "Red",\n  "Green": "Green",\n  "Blue": "Blue",\n  "Yellow": "Yellow",\n  "Magenta": "Magenta",\n  "Cyan": "Cyan",\n  "Background": "Background",\n  "Window": "Window",\n  "Transparent": "Transparent",\n  "Semi-Transparent": "Semi-Transparent",\n  "Opaque": "Opaque",\n  "Font Size": "Font Size",\n  "Text Edge Style": "Text Edge Style",\n  "None": "None",\n  "Raised": "Raised",\n  "Depressed": "Depressed",\n  "Uniform": "Uniform",\n  "Dropshadow": "Dropshadow",\n  "Font Family": "Font Family",\n  "Proportional Sans-Serif": "Proportional Sans-Serif",\n  "Monospace Sans-Serif": "Monospace Sans-Serif",\n  "Proportional Serif": "Proportional Serif",\n  "Monospace Serif": "Monospace Serif",\n  "Casual": "Casual",\n  "Script": "Script",\n  "Small Caps": "Small Caps",\n  "Reset": "Reset",\n  "restore all settings to the default values": "restore all settings to the default values",\n  "Done": "Done",\n  "Caption Settings Dialog": "Caption Settings Dialog",\n  "Beginning of dialog window. Escape will cancel and close the window.": "Beginning of dialog window. Escape will cancel and close the window.",\n  "End of dialog window.": "End of dialog window.",\n  "{1} is loading.": "{1} is loading."\n});\n\n    });\n});;\n\nM.util.js_pending('theme_boost/loader');\nrequire(['theme_boost/loader'], function() {\n  M.util.js_complete('theme_boost/loader');\n});\n;\n\n;\nM.util.js_pending('core/notification'); require(['core/notification'], function(amd) {amd.init(1, []); M.util.js_complete('core/notification');});;\nM.util.js_pending('core/log'); require(['core/log'], function(amd) {amd.setConfig({"level":"warn"}); M.util.js_complete('core/log');});;\nM.util.js_pending('core/page_global'); require(['core/page_global'], function(amd) {amd.init(); M.util.js_complete('core/page_global');});M.util.js_complete("core/first");\n});\n//]]>\n</script>\n<script type="text/javascript">\n//<![CDATA[\nM.str = {"moodle":{"lastmodified":"Last modified","name":"Name","error":"Error","info":"Information","yes":"Yes","no":"No","cancel":"Cancel","confirm":"Confirm","areyousure":"Are you sure?","closebuttontitle":"Close","unknownerror":"Unknown error","file":"File","url":"URL"},"repository":{"type":"Type","size":"Size","invalidjson":"Invalid JSON string","nofilesattached":"No files attached","filepicker":"File picker","logout":"Logout","nofilesavailable":"No files available","norepositoriesavailable":"Sorry, none of your current repositories can return files in the required format.","fileexistsdialogheader":"File exists","fileexistsdialog_editor":"A file with that name has already been attached to the text you are editing.","fileexistsdialog_filemanager":"A file with that name has already been attached","renameto":"Rename to \\"{$a}\\"","referencesexist":"There are {$a} alias\\/shortcut files that use this file as their source","select":"Select"},"admin":{"confirmdeletecomments":"You are about to delete comments, are you sure?","confirmation":"Confirmation"},"debug":{"debuginfo":"Debug info","line":"Line","stacktrace":"Stack trace"},"langconfig":{"labelsep":": "}};\n//]]>\n</script>\n<script type="text/javascript">\n//<![CDATA[\n(function() {Y.use("moodle-filter_mathjaxloader-loader",function() {M.filter_mathjaxloader.configure({"mathjaxconfig":"\\nMathJax.Hub.Config({\\n    config: [\\"Accessible.js\\", \\"Safe.js\\"],\\n    errorSettings: { message: [\\"!\\"] },\\n    skipStartupTypeset: true,\\n    messageStyle: \\"none\\"\\n});\\n","lang":"en"});\n});\nM.util.help_popups.setup(Y);\n M.util.js_pending('random685a5eddb1e792'); Y.on('domready', function() { M.util.js_complete("init");  M.util.js_complete('random685a5eddb1e792'); });\n})();\n//]]>\n</script>\n\n        </div>\n    </footer>\n</div>\n\n</body>\n</html>		login	\N	2	2025-06-24 13:18:19.28046	2025-06-24 13:18:19.28046	11
3	riphah	sda	<!DOCTYPE html>\n\n<html  dir="ltr" lang="en" xml:lang="en">\n<head>\n    <title>Riphah International University: Log in to the site</title>\n    <link rel="shortcut icon" href="https://moellim.riphah.edu.pk/theme/image.php/classic/theme/1746215662/favicon" />\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n<meta name="keywords" content="moodle, Riphah International University: Log in to the site" />\n<link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.css" /><script id="firstthemesheet" type="text/css">/** Required in order to fix style inclusion problems in IE with YUI **/</script><link rel="stylesheet" type="text/css" href="https://moellim.riphah.edu.pk/theme/styles.php/classic/1746215662_1/all" />\n<script type="text/javascript">\n//<![CDATA[\nvar M = {}; M.yui = {};\nM.pageloadstarttime = new Date();\nM.cfg = {"wwwroot":"https:\\/\\/moellim.riphah.edu.pk","sesskey":"HXfvMK7xZU","sessiontimeout":"1800","themerev":"1746215662","slasharguments":1,"theme":"classic","iconsystemmodule":"core\\/icon_system_fontawesome","jsrev":"1745292882","admin":"admin","svgicons":true,"usertimezone":"Asia\\/Karachi","contextid":1,"langrev":1745292882,"templaterev":"1745292882"};var yui1ConfigFn = function(me) {if(/-skin|reset|fonts|grids|base/.test(me.name)){me.type='css';me.path=me.path.replace(/\\.js/,'.css');me.path=me.path.replace(/\\/yui2-skin/,'/assets/skins/sam/yui2-skin')}};\nvar yui2ConfigFn = function(me) {var parts=me.name.replace(/^moodle-/,'').split('-'),component=parts.shift(),module=parts[0],min='-min';if(/-(skin|core)$/.test(me.name)){parts.pop();me.type='css';min=''}\nif(module){var filename=parts.join('-');me.path=component+'/'+module+'/'+filename+min+'.'+me.type}else{me.path=component+'/'+component+'.'+me.type}};\nYUI_config = {"debug":false,"base":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/yuilib\\/3.17.2\\/","comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","combine":true,"filter":null,"insertBefore":"firstthemesheet","groups":{"yui2":{"base":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/yuilib\\/2in3\\/2.9.0\\/build\\/","comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","combine":true,"ext":false,"root":"2in3\\/2.9.0\\/build\\/","patterns":{"yui2-":{"group":"yui2","configFn":yui1ConfigFn}}},"moodle":{"name":"moodle","base":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?m\\/1745292882\\/","combine":true,"comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","ext":false,"root":"m\\/1745292882\\/","patterns":{"moodle-":{"group":"moodle","configFn":yui2ConfigFn}},"filter":null,"modules":{"moodle-core-actionmenu":{"requires":["base","event","node-event-simulate"]},"moodle-core-dragdrop":{"requires":["base","node","io","dom","dd","event-key","event-focus","moodle-core-notification"]},"moodle-core-popuphelp":{"requires":["moodle-core-tooltip"]},"moodle-core-notification":{"requires":["moodle-core-notification-dialogue","moodle-core-notification-alert","moodle-core-notification-confirm","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-core-notification-dialogue":{"requires":["base","node","panel","escape","event-key","dd-plugin","moodle-core-widget-focusafterclose","moodle-core-lockscroll"]},"moodle-core-notification-alert":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-confirm":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-exception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-notification-ajaxexception":{"requires":["moodle-core-notification-dialogue"]},"moodle-core-languninstallconfirm":{"requires":["base","node","moodle-core-notification-confirm","moodle-core-notification-alert"]},"moodle-core-tooltip":{"requires":["base","node","io-base","moodle-core-notification-dialogue","json-parse","widget-position","widget-position-align","event-outside","cache-base"]},"moodle-core-maintenancemodetimer":{"requires":["base","node"]},"moodle-core-event":{"requires":["event-custom"]},"moodle-core-handlebars":{"condition":{"trigger":"handlebars","when":"after"}},"moodle-core-lockscroll":{"requires":["plugin","base-build"]},"moodle-core-formchangechecker":{"requires":["base","event-focus","moodle-core-event"]},"moodle-core-blocks":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification"]},"moodle-core-chooserdialogue":{"requires":["base","panel","moodle-core-notification"]},"moodle-core_availability-form":{"requires":["base","node","event","event-delegate","panel","moodle-core-notification-dialogue","json"]},"moodle-backup-confirmcancel":{"requires":["node","node-event-simulate","moodle-core-notification-confirm"]},"moodle-backup-backupselectall":{"requires":["node","event","node-event-simulate","anim"]},"moodle-course-formatchooser":{"requires":["base","node","node-event-simulate"]},"moodle-course-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-course-coursebase","moodle-course-util"]},"moodle-course-categoryexpander":{"requires":["node","event-key"]},"moodle-course-modchooser":{"requires":["moodle-core-chooserdialogue","moodle-course-coursebase"]},"moodle-course-management":{"requires":["base","node","io-base","moodle-core-notification-exception","json-parse","dd-constrain","dd-proxy","dd-drop","dd-delegate","node-event-delegate"]},"moodle-course-util":{"requires":["node"],"use":["moodle-course-util-base"],"submodules":{"moodle-course-util-base":{},"moodle-course-util-section":{"requires":["node","moodle-course-util-base"]},"moodle-course-util-cm":{"requires":["node","moodle-course-util-base"]}}},"moodle-form-shortforms":{"requires":["node","base","selector-css3","moodle-core-event"]},"moodle-form-dateselector":{"requires":["base","node","overlay","calendar"]},"moodle-form-passwordunmask":{"requires":[]},"moodle-question-chooser":{"requires":["moodle-core-chooserdialogue"]},"moodle-question-preview":{"requires":["base","dom","event-delegate","event-key","core_question_engine"]},"moodle-question-searchform":{"requires":["base","node"]},"moodle-availability_completion-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_date-form":{"requires":["base","node","event","io","moodle-core_availability-form"]},"moodle-availability_grade-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_group-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_grouping-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-availability_profile-form":{"requires":["base","node","event","moodle-core_availability-form"]},"moodle-mod_assign-history":{"requires":["node","transition"]},"moodle-mod_attendance-groupfilter":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-rooms":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-imports":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-modform":{"requires":["base","node"]},"moodle-mod_bigbluebuttonbn-broker":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_bigbluebuttonbn-recordings":{"requires":["base","node","datasource-get","datasource-jsonschema","datasource-polling","moodle-core-notification"]},"moodle-mod_quiz-dragdrop":{"requires":["base","node","io","dom","dd","dd-scroll","moodle-core-dragdrop","moodle-core-notification","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-base","moodle-mod_quiz-util-page","moodle-mod_quiz-util-slot","moodle-course-util"]},"moodle-mod_quiz-autosave":{"requires":["base","node","event","event-valuechange","node-event-delegate","io-form"]},"moodle-mod_quiz-util":{"requires":["node","moodle-core-actionmenu"],"use":["moodle-mod_quiz-util-base"],"submodules":{"moodle-mod_quiz-util-base":{},"moodle-mod_quiz-util-slot":{"requires":["node","moodle-mod_quiz-util-base"]},"moodle-mod_quiz-util-page":{"requires":["node","moodle-mod_quiz-util-base"]}}},"moodle-mod_quiz-quizbase":{"requires":["base","node"]},"moodle-mod_quiz-modform":{"requires":["base","node","event"]},"moodle-mod_quiz-toolboxes":{"requires":["base","node","event","event-key","io","moodle-mod_quiz-quizbase","moodle-mod_quiz-util-slot","moodle-core-notification-ajaxexception"]},"moodle-mod_quiz-questionchooser":{"requires":["moodle-core-chooserdialogue","moodle-mod_quiz-util","querystring-parse"]},"moodle-message_airnotifier-toolboxes":{"requires":["base","node","io"]},"moodle-filter_glossary-autolinker":{"requires":["base","node","io-base","json-parse","event-delegate","overlay","moodle-core-event","moodle-core-notification-alert","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-filter_mathjaxloader-loader":{"requires":["moodle-core-event"]},"moodle-editor_atto-editor":{"requires":["node","transition","io","overlay","escape","event","event-simulate","event-custom","node-event-html5","node-event-simulate","yui-throttle","moodle-core-notification-dialogue","moodle-core-notification-confirm","moodle-editor_atto-rangy","handlebars","timers","querystring-stringify"]},"moodle-editor_atto-plugin":{"requires":["node","base","escape","event","event-outside","handlebars","event-custom","timers","moodle-editor_atto-menu"]},"moodle-editor_atto-menu":{"requires":["moodle-core-notification-dialogue","node","event","event-custom"]},"moodle-editor_atto-rangy":{"requires":[]},"moodle-report_eventlist-eventfilter":{"requires":["base","event","node","node-event-delegate","datatable","autocomplete","autocomplete-filters"]},"moodle-report_loglive-fetchlogs":{"requires":["base","event","node","io","node-event-delegate"]},"moodle-gradereport_grader-gradereporttable":{"requires":["base","node","event","handlebars","overlay","event-hover"]},"moodle-gradereport_history-userselector":{"requires":["escape","event-delegate","event-key","handlebars","io-base","json-parse","moodle-core-notification-dialogue"]},"moodle-tool_capability-search":{"requires":["base","node"]},"moodle-tool_lp-dragdrop-reorder":{"requires":["moodle-core-dragdrop"]},"moodle-tool_monitor-dropdown":{"requires":["base","event","node"]},"moodle-assignfeedback_editpdf-editor":{"requires":["base","event","node","io","graphics","json","event-move","event-resize","transition","querystring-stringify-simple","moodle-core-notification-dialog","moodle-core-notification-alert","moodle-core-notification-warning","moodle-core-notification-exception","moodle-core-notification-ajaxexception"]},"moodle-atto_accessibilitychecker-button":{"requires":["color-base","moodle-editor_atto-plugin"]},"moodle-atto_accessibilityhelper-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_align-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_bold-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_charmap-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_clear-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_collapse-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emojipicker-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_emoticon-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_equation-button":{"requires":["moodle-editor_atto-plugin","moodle-core-event","io","event-valuechange","tabview","array-extras"]},"moodle-atto_h5p-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_html-codemirror":{"requires":["moodle-atto_html-codemirror-skin"]},"moodle-atto_html-beautify":{},"moodle-atto_html-button":{"requires":["promise","moodle-editor_atto-plugin","moodle-atto_html-beautify","moodle-atto_html-codemirror","event-valuechange"]},"moodle-atto_image-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_indent-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_italic-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_link-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_managefiles-usedfiles":{"requires":["node","escape"]},"moodle-atto_managefiles-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_media-button":{"requires":["moodle-editor_atto-plugin","moodle-form-shortforms"]},"moodle-atto_noautolink-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_orderedlist-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_recordrtc-recording":{"requires":["moodle-atto_recordrtc-button"]},"moodle-atto_recordrtc-button":{"requires":["moodle-editor_atto-plugin","moodle-atto_recordrtc-recording"]},"moodle-atto_rtl-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_snippet-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_strike-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_subscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_superscript-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_table-button":{"requires":["moodle-editor_atto-plugin","moodle-editor_atto-menu","event","event-valuechange"]},"moodle-atto_title-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_underline-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_undo-button":{"requires":["moodle-editor_atto-plugin"]},"moodle-atto_unorderedlist-button":{"requires":["moodle-editor_atto-plugin"]}}},"gallery":{"name":"gallery","base":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/yuilib\\/gallery\\/","combine":true,"comboBase":"https:\\/\\/moellim.riphah.edu.pk\\/theme\\/yui_combo.php?","ext":false,"root":"gallery\\/1745292882\\/","patterns":{"gallery-":{"group":"gallery"}}}},"modules":{"core_filepicker":{"name":"core_filepicker","fullpath":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/javascript.php\\/1745292882\\/repository\\/filepicker.js","requires":["base","node","node-event-simulate","json","async-queue","io-base","io-upload-iframe","io-form","yui2-treeview","panel","cookie","datatable","datatable-sort","resize-plugin","dd-plugin","escape","moodle-core_filepicker","moodle-core-notification-dialogue"]},"core_comment":{"name":"core_comment","fullpath":"https:\\/\\/moellim.riphah.edu.pk\\/lib\\/javascript.php\\/1745292882\\/comment\\/comment.js","requires":["base","io-base","node","json","yui2-animation","overlay","escape"]},"mathjax":{"name":"mathjax","fullpath":"https:\\/\\/cdnjs.cloudflare.com\\/ajax\\/libs\\/mathjax\\/2.7.2\\/MathJax.js?delayStartupUntil=configured"}}};\nM.yui.loader = {modules: {}};\n\n//]]>\n</script>\n\n<!-- Global site tag (gtag.js) - Google Analytics -->\r\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-N3MDL6BKSN"></script>\r\n<script>\r\n  window.dataLayer = window.dataLayer || [];\r\n  function gtag(){dataLayer.push(arguments);}\r\n  gtag('js', new Date());\r\n\r\n  gtag('config', 'G-N3MDL6BKSN');\r\n</script><meta name="robots" content="noindex" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>\n<body  id="page-login-index" class="format-site  path-login chrome dir-ltr lang-en yui-skin-sam yui3-skin-sam moellim-riphah-edu-pk pagelayout-login course-1 context-1 notloggedin ">\n<div class="toast-wrapper mx-auto py-3 fixed-top" role="status" aria-live="polite"></div>\n\n<div id="page-wrapper">\n\n    <div>\n    <a class="sr-only sr-only-focusable" href="#maincontent">Skip to main content</a>\n</div><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/babel-polyfill/polyfill.min.js"></script>\n<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/mdn-polyfills/polyfill.js"></script>\n<script type="text/javascript" src="https://moellim.riphah.edu.pk/theme/yui_combo.php?rollup/3.17.2/yui-moodlesimple-min.js"></script><script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/javascript-static.js"></script>\n<script type="text/javascript">\n//<![CDATA[\ndocument.body.className += ' jsenabled';\n//]]>\n</script>\n\n\n\n    <div id="page" class="container-fluid mt-0">\n        <div id="page-content" class="row">\n            <div id="region-main-box" class="col-12">\n                <section id="region-main" class="col-12" aria-label="Content">\n                    <span class="notifications" id="user-notifications"></span>\n                    <div role="main"><span id="maincontent"></span><div class="my-1 my-sm-5"></div>\n<div class="row justify-content-center">\n<div class="col-xl-6 col-sm-8 ">\n<div class="card">\n    <div class="card-block">\n            <h2 class="card-header text-center" ><img src="https://moellim.riphah.edu.pk/pluginfile.php/1/core_admin/logo/0x200/1746215662/logo%20%281%29.png" class="img-fluid" title="Riphah International University" alt="Riphah International University"/></h2>\n        <div class="card-body">\n\n\n            <div class="row justify-content-md-center">\n                <div class="col-md-5">\n                    <form class="mt-3" action="https://moellim.riphah.edu.pk/login/index.php" method="post" id="login">\n                        <input id="anchor" type="hidden" name="anchor" value="">\n                        <script>document.getElementById('anchor').value = location.hash;</script>\n                        <input type="hidden" name="logintoken" value="HTNWIqRrbREguvqmzeYEq6uWLpyiPUBD">\n                        <div class="form-group">\n                            <label for="username" class="sr-only">\n                                    Username\n                            </label>\n                            <input type="text" name="username" id="username"\n                                class="form-control"\n                                value=""\n                                placeholder="Username"\n                                autocomplete="username">\n                        </div>\n                        <div class="form-group">\n                            <label for="password" class="sr-only">Password</label>\n                            <input type="password" name="password" id="password" value=""\n                                class="form-control"\n                                placeholder="Password"\n                                autocomplete="current-password">\n                        </div>\n                            <div class="rememberpass mt-3">\n                                <input type="checkbox" name="rememberusername" id="rememberusername" value="1"  />\n                                <label for="rememberusername">Remember username</label>\n                            </div>\n\n                        <button type="submit" class="btn btn-primary btn-block mt-3" id="loginbtn">Log in</button>\n                    </form>\n                </div>\n\n                <div class="col-md-5">\n                    <div class="forgetpass mt-3">\n                        <p><a href="https://moellim.riphah.edu.pk/login/forgot_password.php">Forgotten your username or password?</a></p>\n                    </div>\n\n                    <div class="mt-3">\n                        Cookies must be enabled in your browser\n                        <a class="btn btn-link p-0" role="button"\n    data-container="body" data-toggle="popover"\n    data-placement="right" data-content="&lt;div class=&quot;no-overflow&quot;&gt;&lt;p&gt;Two cookies are used on this site:&lt;/p&gt;\n\n&lt;p&gt;The essential one is the session cookie, usually called MoodleSession. You must allow this cookie in your browser to provide continuity and to remain logged in when browsing the site. When you log out or close the browser, this cookie is destroyed (in your browser and on the server).&lt;/p&gt;\n\n&lt;p&gt;The other cookie is purely for convenience, usually called MOODLEID or similar. It just remembers your username in the browser. This means that when you return to this site, the username field on the login page is already filled in for you. It is safe to refuse this cookie - you will just have to retype your username each time you log in.&lt;/p&gt;\n&lt;/div&gt; "\n    data-html="true" tabindex="0" data-trigger="focus">\n  <i class="icon fa fa-question-circle text-info fa-fw "  title="Help with Cookies must be enabled in your browser" aria-label="Help with Cookies must be enabled in your browser"></i>\n</a>\n                    </div>\n\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n</div>\n</div></div>\n                    \n                </section>\n            </div>\n        </div>\n    </div>\n    <footer id="page-footer" class="py-3 bg-dark text-light">\n        <div class="container">\n            <div id="course-footer"></div>\n\n\n            <div class="logininfo">You are not logged in.</div>\n            <div class="homelink"><a href="https://moellim.riphah.edu.pk/">Home</a></div>\n            \n            <script type="text/javascript">\n//<![CDATA[\nvar require = {\n    baseUrl : 'https://moellim.riphah.edu.pk/lib/requirejs.php/1745292882/',\n    // We only support AMD modules with an explicit define() statement.\n    enforceDefine: true,\n    skipDataMain: true,\n    waitSeconds : 0,\n\n    paths: {\n        jquery: 'https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/jquery-3.4.1.min',\n        jqueryui: 'https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/jquery/ui-1.12.1/jquery-ui.min',\n        jqueryprivate: 'https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/jquery-private'\n    },\n\n    // Custom jquery config map.\n    map: {\n      // '*' means all modules will get 'jqueryprivate'\n      // for their 'jquery' dependency.\n      '*': { jquery: 'jqueryprivate' },\n      // Stub module for 'process'. This is a workaround for a bug in MathJax (see MDL-60458).\n      '*': { process: 'core/first' },\n\n      // 'jquery-private' wants the real jQuery module\n      // though. If this line was not here, there would\n      // be an unresolvable cyclic dependency.\n      jqueryprivate: { jquery: 'jquery' }\n    }\n};\n\n//]]>\n</script>\n<script type="text/javascript" src="https://moellim.riphah.edu.pk/lib/javascript.php/1745292882/lib/requirejs/require.min.js"></script>\n<script type="text/javascript">\n//<![CDATA[\nM.util.js_pending("core/first");require(['core/first'], function() {\n;\nrequire(["media_videojs/loader"], function(loader) {\n    loader.setUp(function(videojs) {\n        videojs.options.flash.swf = "https://moellim.riphah.edu.pk/media/player/videojs/videojs/video-js.swf";\nvideojs.addLanguage('en', {\n  "Audio Player": "Audio Player",\n  "Video Player": "Video Player",\n  "Play": "Play",\n  "Pause": "Pause",\n  "Replay": "Replay",\n  "Current Time": "Current Time",\n  "Duration": "Duration",\n  "Remaining Time": "Remaining Time",\n  "Stream Type": "Stream Type",\n  "LIVE": "LIVE",\n  "Seek to live, currently behind live": "Seek to live, currently behind live",\n  "Seek to live, currently playing live": "Seek to live, currently playing live",\n  "Loaded": "Loaded",\n  "Progress": "Progress",\n  "Progress Bar": "Progress Bar",\n  "progress bar timing: currentTime={1} duration={2}": "{1} of {2}",\n  "Fullscreen": "Fullscreen",\n  "Non-Fullscreen": "Non-Fullscreen",\n  "Mute": "Mute",\n  "Unmute": "Unmute",\n  "Playback Rate": "Playback Rate",\n  "Subtitles": "Subtitles",\n  "subtitles off": "subtitles off",\n  "Captions": "Captions",\n  "captions off": "captions off",\n  "Chapters": "Chapters",\n  "Descriptions": "Descriptions",\n  "descriptions off": "descriptions off",\n  "Audio Track": "Audio Track",\n  "Volume Level": "Volume Level",\n  "You aborted the media playback": "You aborted the media playback",\n  "A network error caused the media download to fail part-way.": "A network error caused the media download to fail part-way.",\n  "The media could not be loaded, either because the server or network failed or because the format is not supported.": "The media could not be loaded, either because the server or network failed or because the format is not supported.",\n  "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.": "The media playback was aborted due to a corruption problem or because the media used features your browser did not support.",\n  "No compatible source was found for this media.": "No compatible source was found for this media.",\n  "The media is encrypted and we do not have the keys to decrypt it.": "The media is encrypted and we do not have the keys to decrypt it.",\n  "Play Video": "Play Video",\n  "Close": "Close",\n  "Close Modal Dialog": "Close Modal Dialog",\n  "Modal Window": "Modal Window",\n  "This is a modal window": "This is a modal window",\n  "This modal can be closed by pressing the Escape key or activating the close button.": "This modal can be closed by pressing the Escape key or activating the close button.",\n  ", opens captions settings dialog": ", opens captions settings dialog",\n  ", opens subtitles settings dialog": ", opens subtitles settings dialog",\n  ", opens descriptions settings dialog": ", opens descriptions settings dialog",\n  ", selected": ", selected",\n  "captions settings": "captions settings",\n  "subtitles settings": "subititles settings",\n  "descriptions settings": "descriptions settings",\n  "Text": "Text",\n  "White": "White",\n  "Black": "Black",\n  "Red": "Red",\n  "Green": "Green",\n  "Blue": "Blue",\n  "Yellow": "Yellow",\n  "Magenta": "Magenta",\n  "Cyan": "Cyan",\n  "Background": "Background",\n  "Window": "Window",\n  "Transparent": "Transparent",\n  "Semi-Transparent": "Semi-Transparent",\n  "Opaque": "Opaque",\n  "Font Size": "Font Size",\n  "Text Edge Style": "Text Edge Style",\n  "None": "None",\n  "Raised": "Raised",\n  "Depressed": "Depressed",\n  "Uniform": "Uniform",\n  "Dropshadow": "Dropshadow",\n  "Font Family": "Font Family",\n  "Proportional Sans-Serif": "Proportional Sans-Serif",\n  "Monospace Sans-Serif": "Monospace Sans-Serif",\n  "Proportional Serif": "Proportional Serif",\n  "Monospace Serif": "Monospace Serif",\n  "Casual": "Casual",\n  "Script": "Script",\n  "Small Caps": "Small Caps",\n  "Reset": "Reset",\n  "restore all settings to the default values": "restore all settings to the default values",\n  "Done": "Done",\n  "Caption Settings Dialog": "Caption Settings Dialog",\n  "Beginning of dialog window. Escape will cancel and close the window.": "Beginning of dialog window. Escape will cancel and close the window.",\n  "End of dialog window.": "End of dialog window.",\n  "{1} is loading.": "{1} is loading."\n});\n\n    });\n});;\n\nM.util.js_pending('theme_boost/loader');\nrequire(['theme_boost/loader'], function() {\n  M.util.js_complete('theme_boost/loader');\n});\n;\n\n;\nM.util.js_pending('core/notification'); require(['core/notification'], function(amd) {amd.init(1, []); M.util.js_complete('core/notification');});;\nM.util.js_pending('core/log'); require(['core/log'], function(amd) {amd.setConfig({"level":"warn"}); M.util.js_complete('core/log');});;\nM.util.js_pending('core/page_global'); require(['core/page_global'], function(amd) {amd.init(); M.util.js_complete('core/page_global');});M.util.js_complete("core/first");\n});\n//]]>\n</script>\n<script type="text/javascript">\n//<![CDATA[\nM.str = {"moodle":{"lastmodified":"Last modified","name":"Name","error":"Error","info":"Information","yes":"Yes","no":"No","cancel":"Cancel","confirm":"Confirm","areyousure":"Are you sure?","closebuttontitle":"Close","unknownerror":"Unknown error","file":"File","url":"URL"},"repository":{"type":"Type","size":"Size","invalidjson":"Invalid JSON string","nofilesattached":"No files attached","filepicker":"File picker","logout":"Logout","nofilesavailable":"No files available","norepositoriesavailable":"Sorry, none of your current repositories can return files in the required format.","fileexistsdialogheader":"File exists","fileexistsdialog_editor":"A file with that name has already been attached to the text you are editing.","fileexistsdialog_filemanager":"A file with that name has already been attached","renameto":"Rename to \\"{$a}\\"","referencesexist":"There are {$a} alias\\/shortcut files that use this file as their source","select":"Select"},"admin":{"confirmdeletecomments":"You are about to delete comments, are you sure?","confirmation":"Confirmation"},"debug":{"debuginfo":"Debug info","line":"Line","stacktrace":"Stack trace"},"langconfig":{"labelsep":": "}};\n//]]>\n</script>\n<script type="text/javascript">\n//<![CDATA[\n(function() {Y.use("moodle-filter_mathjaxloader-loader",function() {M.filter_mathjaxloader.configure({"mathjaxconfig":"\\nMathJax.Hub.Config({\\n    config: [\\"Accessible.js\\", \\"Safe.js\\"],\\n    errorSettings: { message: [\\"!\\"] },\\n    skipStartupTypeset: true,\\n    messageStyle: \\"none\\"\\n});\\n","lang":"en"});\n});\nM.util.help_popups.setup(Y);\n M.util.js_pending('random685a880ab0e7f2'); Y.on('domready', function() { M.util.js_complete("init");  M.util.js_complete('random685a880ab0e7f2'); });\n})();\n//]]>\n</script>\n\n        </div>\n    </footer>\n</div>\n\n</body>\n</html>	https://moellim.riphah.edu.pk/login/index.php	login	https://moellim.riphah.edu.pk/pluginfile.php/1/core_admin/logo/0x200/1746215662/logo%20%281%29.png	2	2025-06-24 16:15:36.603998	2025-06-24 16:15:36.603998	11
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (id, user_id, email_notifications, push_notifications, campaign_alerts, security_alerts, system_updates, weekly_reports, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, organization_id, type, title, message, is_read, priority, action_url, metadata, created_at, read_at) FROM stdin;
\.


--
-- Data for Name: organization_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization_settings (id, organization_id, logo_url, theme, settings) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, created_at, updated_at, industry, address, logo_url, settings) FROM stdin;
1	Test Organization	2025-04-30 02:37:00.242	2025-04-30 02:37:00.242	\N	\N	\N	\N
2	Riphah International University	2025-05-06 03:17:07.962	2025-05-06 03:17:07.962	\N	\N	\N	\N
3	None	2025-05-06 08:39:33.943	2025-05-06 08:39:33.943	\N	\N	\N	\N
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
1	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidW1hcndhcWFyMzkwQG1haWwuY29tIiwicHVycG9zZSI6InBhc3N3b3JkLXJlc2V0IiwiaWF0IjoxNzQ2NTM1ODIwLCJleHAiOjE3NDY1Mzk0MjB9.kZd_w5-2v6whY5E97e4MDPQ_HUmp4hYvh4_C0Kv8HDk	2025-05-06 08:50:20.957	t	2025-05-06 07:50:20.947
2	6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImVtYWlsIjoidW1hcndhcWFyMzkwQG1haWwuY29tIiwicHVycG9zZSI6InBhc3N3b3JkLXJlc2V0IiwiaWF0IjoxNzQ2NTM2MDIzLCJleHAiOjE3NDY1Mzk2MjN9.5BDTbZb-9nZ4t-ne1vZHbLe-f1XwM0Jt8ZD3LIwiKQ4	2025-05-06 08:53:43.558	t	2025-05-06 07:53:43.578
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: smtp_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.smtp_profiles (id, name, host, port, username, password, from_name, from_email, organization_id, created_at, updated_at) FROM stdin;
1	test	test@example.com	587	test@example.com	password123	TEST	test@example.com	1	2025-05-01 02:06:18.055	2025-05-01 02:06:18.055
2	test	test@example.com	587	test00user@mail.com	Uma212295@w	it	phsihing@mail.com	2	2025-06-24 10:58:57.804124	2025-06-24 10:58:57.804124
3	PhishNet	test@example.com	587	test00user@mail.com	Uma212295@w	TEST	test00user@mail.com	2	2025-06-24 16:16:24.040027	2025-06-24 16:16:24.040027
\.


--
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.targets (id, first_name, last_name, email, "position", group_id, organization_id, created_at, updated_at, department) FROM stdin;
1	fdg	sdfds	test@example.com	test	2	1	2025-05-01 02:09:48.632	2025-05-01 02:09:48.632	General
5	ali	smit	admin@example.com	it manager	8	2	2025-07-06 17:11:54.220394	2025-07-06 17:11:54.220394	General
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, first_name, last_name, profile_picture, "position", bio, failed_login_attempts, last_failed_login, account_locked, account_locked_until, is_admin, organization_id, organization_name, created_at, updated_at, last_login) FROM stdin;
1	test@example.com	35e8924a082500ae91d88d47889995831ba27836bec8cb5b12e913ae73a0ae9d6be21f79c810949b668732c0137b0a1dc78281a9a1f7c1b805eec98d32dc66e3.3d364ab1cd94cb0564df901d98270529	Test	User	\N	\N	\N	1	2025-05-06 11:30:21.383	f	\N	t	1	Test Organization	2025-04-30 02:37:00.345	2025-05-06 06:30:21.383	\N
2	test3@example.com	eed2801626e0cbe16d9c59f8d77c4201b0ad977092dd58be799583c455fcdfb30bcd403b9868f457361e77cbc245622853deddcf0d69466caa035def5165656f.eb667181af196cd5d16f9f6136a7f597	Test3	User	\N	\N	\N	0	\N	f	\N	f	1	Test Organization	2025-05-01 02:26:07.082	2025-05-01 02:26:07.082	\N
3	test1@example.com	22a5d7916c9bc4db945b19ed1122de7484e988c546f035732590f4c0600fa64e8854d3a2aec92bb9cd69a03097e725a5b102d81e852cfb7f3c33f9e424cc5568.cba891deb3245b48e882f3c969ed6fa8	Test1	User	/uploads/profile-1746518412193-598425798.jpg			0	\N	f	\N	t	1	Test Organization	2025-05-06 02:46:16.43	2025-05-06 03:00:20.931	\N
4	test2@example.com	75e8154b4a3f79bf6a396b49905414b37de102f4d969c2d50af1ed628cae3f544c3893a6caa3e2596df19b439d9cfd752f73d4527e91dfba9fea5dbd688d96cb.df299b3e5a7dd538d15452a99a3efe001addbf19bfa8bc5d0256ae9e2868a290	Test1	User	/uploads/profile-1746531084681-182423878.png			0	\N	f	\N	t	2	Riphah International University	2025-05-06 03:17:08.045	2025-05-06 06:41:22.592	\N
5	shahanhabib890@gmail.com	2bcb1133381ee07528ce83ea7508931b8395e8f5a147cd5301336c7e9670f1ab3aa70f70b78db4ad2cadaed07eb53995d342a0a3144ec8f3153e92c2bfd46aa2.d6687002c1eeba4c8837148139ade3340068dd8ba0330cfd33f094fd72f36dfe	shahan	habib	\N	\N	\N	0	\N	f	\N	t	2	Riphah International University	2025-05-06 07:21:56.902	2025-05-06 07:21:56.902	\N
6	umarwaqar390@mail.com	3452ce1ac096ed406f69c09f290835633aeadf53027311197736d1542bbff67d2f51a0e72a4f75131151b04aee52ad63dee4b4e6c853264fad1397325e832d80.9aff30daeeeda09a07d9610109252119714ea1e8a8c08db948447ba96e101ed4	shahan	habib	\N	\N	\N	0	\N	f	\N	t	2	Riphah International University	2025-05-06 07:24:08.887	2025-06-23 02:31:20.075	\N
9	test4@example.com	3ca81d645b5942da70a7717db8dca7262da9f48276127450ff5002db3800bc33fe7e9765b2d8cec83e12667efa7f7907dc5527050b421feda9b46bf9ed983808.caf177d102ddf69335365a30ec7df0495800747a8e123f356f511e753b20abc8	test4	user	\N	\N	\N	0	\N	f	\N	f	3	None	2025-05-06 08:39:34.077	2025-05-06 08:39:46.529	\N
12	umarwaqar@mail.com	85ef23f7f09516515938f0411b5baab12fc27015641a493909ba904e12364699680bec1349a4b98be5c17dfff20f257fb7d0f450c741fc437b40463e3cf38a52.84b04880eb136688e8f35f31481620cd526802ed420dd119f2f57e6aa57fb911	umar	waqar	\N	\N	\N	0	\N	f	\N	f	2	Riphah International University	2025-06-24 16:10:37.538702	2025-06-24 16:10:37.538702	\N
13	umarwaqar0@mail.com	53f5463bc6837922dae2ff671c7be513cd1b90e4e55f47715aa029f014fd7a4321f69263f113c48a7d4523690488f47271778964827d74ad421ae6960bbdd2a3.2c3b3d8d3f26e3e12c0514cbcab2abc66f0c0bd43b88dee845deee687b77027b	test3	user	\N	\N	\N	0	\N	f	\N	f	2	Riphah International University	2025-06-24 16:17:33.581331	2025-06-24 16:17:33.581331	\N
11	test00user@mail.com	a22a343b71a92ed060072c89fb3edadd75a8866198e32c60c495600911f1e96c783104dfd9780ebf6575ad6b71a425f5c595e130e4ee9f2bc6acb62a44b719d0.ed3b036556bb874ad3ccc5d4f1aba9ad421fad58ab68b4d30a5286ca985b07a8	test3	user	/uploads/profile-1751377754244-933966634.jpg	it		0	\N	f	\N	f	2	Riphah International University	2025-06-24 10:53:39.510025	2025-07-16 12:40:22.896	\N
10	test0user@mail.com	f6938ef14879aabe37c34dff1306a0d1907641b0cbf29f91c26c883be33a937e69521b5c6cb305f5033fde92a7c85fe9f5e4d49ab5b3ba6209b327092b622563.86c1a478adff2f07df2e3c3fde8b2744820427e212b4fc9061560a8df8094ea4	test0	user	\N	\N	\N	0	\N	f	\N	f	3	None	2025-06-23 21:03:38.063127	2025-06-24 06:59:32.795	\N
14	admin@example.com	bee37e61318bfa558e9213c9312b9c54bf89011fe05766a02c8b52eff3aec2b9d8d137c6564d0ef0c18ef3401e5d6ba0ed0db67d4bdcabc7642294521de1313e.408bc71f09587febd02f2e7ca10eb39ab5cbaee68c98f397a02c78997a57907f	admin	admin	\N	\N	\N	0	\N	f	\N	f	3	None	2025-07-16 17:51:24.606098	2025-07-16 12:52:03.661	\N
\.


--
-- Name: campaign_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_results_id_seq', 1, false);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 6, true);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 13, true);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.groups_id_seq', 8, true);


--
-- Name: landing_pages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landing_pages_id_seq', 3, true);


--
-- Name: notification_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_preferences_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: organization_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organization_settings_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organizations_id_seq', 3, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 2, true);


--
-- Name: smtp_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.smtp_profiles_id_seq', 3, true);


--
-- Name: targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.targets_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: campaign_results campaign_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: landing_pages landing_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT landing_pages_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organization_settings organization_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: smtp_profiles smtp_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smtp_profiles
    ADD CONSTRAINT smtp_profiles_pkey PRIMARY KEY (id);


--
-- Name: targets targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_campaign_results_clicked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_clicked ON public.campaign_results USING btree (clicked);


--
-- Name: idx_campaign_results_opened; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_opened ON public.campaign_results USING btree (opened);


--
-- Name: idx_campaign_results_sent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_sent ON public.campaign_results USING btree (sent);


--
-- Name: idx_campaign_results_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_results_status ON public.campaign_results USING btree (status);


--
-- Name: idx_email_templates_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_templates_name ON public.email_templates USING btree (name);


--
-- Name: idx_email_templates_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_email_templates_type ON public.email_templates USING btree (type);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_organization_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_organization_id ON public.notifications USING btree (organization_id);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_targets_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_targets_department ON public.targets USING btree (department);


--
-- Name: idx_targets_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_targets_email ON public.targets USING btree (email);


--
-- Name: campaign_results campaign_results_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_results campaign_results_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: campaign_results campaign_results_target_id_targets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_results
    ADD CONSTRAINT campaign_results_target_id_targets_id_fk FOREIGN KEY (target_id) REFERENCES public.targets(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: campaigns campaigns_email_template_id_email_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_email_template_id_email_templates_id_fk FOREIGN KEY (email_template_id) REFERENCES public.email_templates(id) ON DELETE RESTRICT;


--
-- Name: campaigns campaigns_landing_page_id_landing_pages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_landing_page_id_landing_pages_id_fk FOREIGN KEY (landing_page_id) REFERENCES public.landing_pages(id) ON DELETE RESTRICT;


--
-- Name: campaigns campaigns_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_smtp_profile_id_smtp_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_smtp_profile_id_smtp_profiles_id_fk FOREIGN KEY (smtp_profile_id) REFERENCES public.smtp_profiles(id) ON DELETE RESTRICT;


--
-- Name: campaigns campaigns_target_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_target_group_id_groups_id_fk FOREIGN KEY (target_group_id) REFERENCES public.groups(id) ON DELETE RESTRICT;


--
-- Name: email_templates email_templates_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: email_templates email_templates_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: groups groups_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: landing_pages landing_pages_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT landing_pages_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: landing_pages landing_pages_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landing_pages
    ADD CONSTRAINT landing_pages_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: organization_settings organization_settings_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization_settings
    ADD CONSTRAINT organization_settings_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: smtp_profiles smtp_profiles_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.smtp_profiles
    ADD CONSTRAINT smtp_profiles_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: targets targets_group_id_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_group_id_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: targets targets_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: users users_organization_id_organizations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_organization_id_organizations_id_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

