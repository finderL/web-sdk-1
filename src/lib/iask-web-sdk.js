(function () {

    'use strict';

    // 默认配置
    var DEFAULT_CONFIG = {
        // 上报服务器域名配置
        'track_url': 'http://localhost:3300/',
        // 'track_url': 'http://192.168.1.158/ishare/bilog',
        // debug启动配置
        'debug': true,
        // 本地存储配置
        'local_storage': {
            // 存储方式  localStorage || cookie
            'type': 'localStorage',
            // 存储名称
            'name': '',
            // 关闭存储功能
            'disable': false,
            // cookie存储时，采用安全的存储方式，即：
            //当secure属性设置为true时，cookie只有在https协议下才能上传到服务器，而在http协议下是没法上传的，所以也不会被窃听
            'secure_cookie': false,
            // cookie存储时，跨主域名存储配置
            'cross_subdomain_cookie': true,
            // cookie方法存储时，配置保存过期时间，下面配置是1年
            'cookie_expiration': 31536000
        },
        // 初始化sdk时触发的方法
        'loaded': function loaded() {
        },
        // 上报数据实现形式  post, get, img
        'track_type': '',
        // 单页面应用配置
        'SPA': {
            // 开启SPA配置
            'is': false,
            // SPA 实现类型，hash || history
            'mode': 'hash'
        },
        // PV指标自动触发配置
        'pageview': true,
        // 上报数据前，每个字段长度截取配置，默认不截取
        'truncateLength': -1,
        // 会话超时时长，默认30分钟
        'session_interval_mins': 1,
        // 远程拉取可视化圈选插件地址
        'auto_visualization_src': 'http://localhost:3300/build/plugins/auto_visualization/main.js'
    };

    // 配置产品信息,业务方根据具体情况修改
    var PRODUCT_CONFIG = {
        TERMINAL_TYPE: '0',        // 终端类型
        PRODUCT_NAME: 'ishare',    // 产品名称
        SITE_TYPE: '办公频道',      // 站点类型
        PRODUCT_CODE: '0',         // 产品代码
        PRODUCT_VER: 'V1.0.0',     // 产品版本
        APP_CHANNEL: '',           // app应用渠道渠道
    };

    //SDK信息配置
    var SDK_CONFIG = {
        SDK_VERSION: '0.1.0'       // sdk版本，业务方不需要修改
    };

    //系统配置
    var SYSTEM_CONFIG = {
        DEBUG: true
    };

    // 系统事件类型（事件分为：系统事件和业务事件）
    var SYSTEM_EVENT_TYPE = 'system';

    // 业务事件类型
    var BUSSINESS_EVENT_TYPE = 'business';

    // 系统事件列表
    var SYSTEM_EVENT_OBJECT = {

        // 基础PV事件
        'normalPageView': {
            'event_id': 'NE001',
            'event_name': 'normalPageView',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 会话开始事件
        'sessionStart': {
            'event_id': 'SY001',
            'event_name': 'sessionStart',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 会话结束事件
        'sessionClose': {
            'event_id': 'SY002',
            'event_name': 'sessionClose',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 广告点击事件
        'adClick': {
            'event_id': 'SY003',
            'event_name': 'adClick',
            'event_type': 'click',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 用户首次访问网站事件
        'activate': {
            'event_id': 'SY004',
            'event_name': 'activate',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // A/B 测试事件
        'abTest': {
            'event_id': 'SY005',
            'event_name': 'abTest',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 异常错误事件
        'error': {
            'event_id': 'SY006',
            'event_name': 'error',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 用户注册事件
        'signup': {
            'event_id': 'SY007',
            'event_name': 'signup',
            'event_type': 'click',
            'data_type': SYSTEM_EVENT_TYPE
        },
        //设置visitID
        'setVisitID': {
            'event_id': 'SY008',
            'event_name': 'setVisitID',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 用户登录事件
        'login': {
            'event_id': 'SY009',
            'event_name': 'login',
            'event_type': 'click',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 用户登出事件
        'logout': {
            'event_id': 'SY010',
            'event_name': 'logout',
            'event_type': 'click',
            'data_type': SYSTEM_EVENT_TYPE
        },
        'clearVisitID': {
            'event_id': 'SY011',
            'event_name': 'clearVisitID',
            'event_type': 'click',
            'data_type': SYSTEM_EVENT_TYPE
        },
        // 用户属性设置事件
        'uproperty': {
            'event_id': 'SY012',
            'event_name': 'uproperty',
            'event_type': 'page',
            'data_type': SYSTEM_EVENT_TYPE
        }
    };

    // People类系统保留属性，用户设置这些属性将无法成功
    var PEOPLE_RESERVED_PROPERTY = ['$deviceUdid', '$toekn'];

    // People类属性事件id，全局唯一
    var PEOPLE_PROPERTY_ID = 'user_property';

    //-------------设备型号等信息--------------
    // userAgentBase
    var userAgentBase = (function () {
        var match;
        var STRINGS_SAMSUNG = 'Samsung',
            STRINGS_SHARP = 'Sharp',
            STRINGS_SONY_ERICSSON = 'Sony Ericsson',
            STRINGS_MOTOROLA = 'Motorola',
            STRINGS_LG = 'LG',
            STRINGS_HUAWEI = 'Huawei',
            STRINGS_HTC = 'HTC',
            STRINGS_COOLPAD = 'Coolpad',
            STRINGS_ASUS = 'Asus',
            STRINGS_ACER = 'Acer';
        var STRINGS_BASED = ' based device';

        var TOUCHWIZ_MODELS = {
            'SAMSUNG': {
                'GT-S3370C': [STRINGS_SAMSUNG, 'Corby 3G'],
                'GT-S3650': [STRINGS_SAMSUNG, 'Corby'],
                'GT-S3653': [STRINGS_SAMSUNG, 'Corby'],
                'GT-S3850': [STRINGS_SAMSUNG, 'Corby II'],
                'GT-S5230': [STRINGS_SAMSUNG, 'Star'],
                'GT-S5230W': [STRINGS_SAMSUNG, 'Star'],
                'GT-S5233': [STRINGS_SAMSUNG, 'Star'],
                'GT-S5260': [STRINGS_SAMSUNG, 'Star II'],
                'GT-S5560': [STRINGS_SAMSUNG, 'Marvel'],
                'GT-S5620': [STRINGS_SAMSUNG, 'Monte'],
                'GT-S7550': [STRINGS_SAMSUNG, 'Blue Earth'],
                'GT-S8000': [STRINGS_SAMSUNG, 'Jet'],
                'GT-S8003': [STRINGS_SAMSUNG, 'Jet'],
                'SGH-F480': [STRINGS_SAMSUNG, 'Tocco'],
                'SGH-T528g': [STRINGS_SAMSUNG, 'Straight Talk'],
                'GT-B3410': [STRINGS_SAMSUNG, 'Star Qwerty'],
                'GT-B5310': [STRINGS_SAMSUNG, 'Corby Pro'],
                'GT-B7722': [STRINGS_SAMSUNG, 'Star Duos'],
                'GT-C6712': [STRINGS_SAMSUNG, 'Star II Duos']
            }
        }

        var BADA_MODELS = {
            'SAMSUNG': {
                'GT- S5250': [STRINGS_SAMSUNG, 'Wave 525'],
                'GT-S5250': [STRINGS_SAMSUNG, 'Wave 525'],
                'GT-S5253': [STRINGS_SAMSUNG, 'Wave 525'],
                'GT-S5330': [STRINGS_SAMSUNG, 'Wave 533'],
                'GT-S5380': [STRINGS_SAMSUNG, 'Wave Y'],
                'GT-S5380D': [STRINGS_SAMSUNG, 'Wave Y'],
                'GT-S5380K': [STRINGS_SAMSUNG, 'Wave Y'],
                'GT-S5750E': [STRINGS_SAMSUNG, 'Wave 575'],
                'GT-S5753E': [STRINGS_SAMSUNG, 'Wave 575'],
                'GT-S7230B': [STRINGS_SAMSUNG, 'Wave 723'],
                'GT-S7230E': [STRINGS_SAMSUNG, 'Wave 723'],
                'GT-S7233E': [STRINGS_SAMSUNG, 'Wave 723'],
                'GT-S7250': [STRINGS_SAMSUNG, 'Wave M'],
                'GT-S7250D': [STRINGS_SAMSUNG, 'Wave M'],
                'GT-S8500': [STRINGS_SAMSUNG, 'Wave'],
                'GT-S8500C': [STRINGS_SAMSUNG, 'Wave'],
                'GT-S8500R': [STRINGS_SAMSUNG, 'Wave'],
                'GT-S8500T': [STRINGS_SAMSUNG, 'Wave'],
                'GT-S8530': [STRINGS_SAMSUNG, 'Wave II'],
                'GT-S8600': [STRINGS_SAMSUNG, 'Wave 3'],
                'SHW-M410': [STRINGS_SAMSUNG, 'Wave 3']
            }
        }

        var TIZEN_MODELS = {
            'SAMSUNG': {
                'GT-I9500': [STRINGS_SAMSUNG, 'GT-I9500']
            }
        }

        var BREW_MODELS = {
            'Coolpad D508': [STRINGS_COOLPAD, 'D508'],
            'Coolpad E600': [STRINGS_COOLPAD, 'E600'],
            'SCH-F839': [STRINGS_SAMSUNG, 'SCH-F839']
        }

        var WINDOWS_MOBILE_MODELS = {
            'DX900': [STRINGS_ACER, 'Tempo DX900'],
            'F900': [STRINGS_ACER, 'Tempo F900'],
            'Coolpad F800': [STRINGS_COOLPAD, 'F800'],
            'garmin-asus-Nuvifone-M10': ['Garmin-Asus', 'Nuvifone M10'],
            'HP iPAQ 510': ['HP', 'iPAQ 510'],
            'HD mini T5555': [STRINGS_HTC, 'HD mini'],
            'HTC HD mini': [STRINGS_HTC, 'HD mini'],
            'HTC HD mini T5555': [STRINGS_HTC, 'HD mini'],
            'HTC HD2': [STRINGS_HTC, 'HD2'],
            'HTC HD2 T8585': [STRINGS_HTC, 'HD2'],
            'HD2 T8585': [STRINGS_HTC, 'HD2'],
            'T-Mobile LEO': [STRINGS_HTC, 'HD2'],
            'dopodT5588': [STRINGS_HTC, 'Hengshan'],
            'HTC Mega-T3333': [STRINGS_HTC, 'Mega'],
            'HTC Snap S521': [STRINGS_HTC, 'Snap'],
            'HTC Touch2 T3320': [STRINGS_HTC, 'Touch 2'],
            'HTC Touch2 T3333': [STRINGS_HTC, 'Touch 2'],
            'HTC Touch2 T3335': [STRINGS_HTC, 'Touch 2'],
            'HTC P3700': [STRINGS_HTC, 'Touch Diamond'],
            'HTC Touch Diamond2 T5353': [STRINGS_HTC, 'Touch Diamond 2'],
            'HTC Touch HD T8282': [STRINGS_HTC, 'Touch HD'],
            'HTC Touch HD T8283': [STRINGS_HTC, 'Touch HD'],
            'HTC Touch HD2 T8585': [STRINGS_HTC, 'Touch HD2'],
            'HTC Touch Pro2 T7373': [STRINGS_HTC, 'Touch Pro 2'],
            'T7380': [STRINGS_HTC, 'Touch Pro 2'],
            'HTC TyTN II': [STRINGS_HTC, 'TyTN II'],
            'GT-B7300': [STRINGS_SAMSUNG, 'Omnia Lite'],
            'GT-B7610': [STRINGS_SAMSUNG, 'Omnia Pro'],
            'GT-i8000': [STRINGS_SAMSUNG, 'Omnia 2'],
            'GT-I8000': [STRINGS_SAMSUNG, 'Omnia 2'],
            'GT-I8000U': [STRINGS_SAMSUNG, 'Omnia 2'],
            'M1i': [STRINGS_SONY_ERICSSON, 'M1i Aspen']
        }

        var WINDOWS_PHONE_MODELS = {
            'Acer': {
                'Allegro': [STRINGS_ACER, 'Allegro'],
                'M310': [STRINGS_ACER, 'Allegro']
            },

            'Asus': {
                'Galaxy6': [STRINGS_ASUS, 'Galaxy 6']
            },

            'DELL': {
                'Venue Pro': ['Dell', 'Venue Pro']
            },

            'FujitsuToshibaMobileCommun': {
                'IS12T': ['Fujitsu Toshiba', 'IS12T']
            },

            'HTC': {
                '7 Mozart': [STRINGS_HTC, '7 Mozart'],
                '7 Mozart T8698': [STRINGS_HTC, '7 Mozart'],
                'T8697': [STRINGS_HTC, '7 Mozart'],
                'T8698': [STRINGS_HTC, '7 Mozart'],
                'PD67100': [STRINGS_HTC, '7 Mozart'],
                'Mozart T8698': [STRINGS_HTC, '7 Mozart'],
                'Mozart': [STRINGS_HTC, '7 Mozart'],
                'USCCHTC-PC93100': [STRINGS_HTC, 'Arrive'],
                'Gold': [STRINGS_HTC, 'Gold '],
                'HD2': [STRINGS_HTC, 'HD2'],
                'HD7': [STRINGS_HTC, 'HD7'],
                'HD7 T9292': [STRINGS_HTC, 'HD7'],
                'T9295': [STRINGS_HTC, 'HD7'],
                'T9296': [STRINGS_HTC, 'HD7'],
                'HD7 Infinity': [STRINGS_HTC, 'HD7'],
                'T7575': [STRINGS_HTC, '7 Pro'],
                '7 Pro T7576': [STRINGS_HTC, '7 Pro'],
                'mwp6985': [STRINGS_HTC, 'Trophy'],
                '7 Trophy T8686': [STRINGS_HTC, 'Trophy'],
                '7 Trophy': [STRINGS_HTC, 'Trophy'],
                'PC40100': [STRINGS_HTC, 'Trophy'],
                'Touch-IT Trophy': [STRINGS_HTC, 'Trophy'],
                'Radar': [STRINGS_HTC, 'Radar'],
                'Radar 4G': [STRINGS_HTC, 'Radar'],
                'Radar C110e': [STRINGS_HTC, 'Radar'],
                'Mazaa': [STRINGS_HTC, 'Mazaa'],
                'Mondrian': [STRINGS_HTC, 'Mondrian'],
                'Schubert': [STRINGS_HTC, 'Schubert'],
                '7 Schubert T9292': [STRINGS_HTC, 'Schubert'],
                'Spark': [STRINGS_HTC, 'Spark'],
                'T8788': [STRINGS_HTC, 'Surround'],
                'TITAN X310e': [STRINGS_HTC, 'Titan'],
                'X310e': [STRINGS_HTC, 'Titan'],
                'PI39100': [STRINGS_HTC, 'Titan'],
                'PI86100': [STRINGS_HTC, 'Titan II'],
                'Ultimate': [STRINGS_HTC, 'Ultimate']
            },

            'LG': {
                'GW910': [STRINGS_LG, 'Optimus 7'],
                'LG E-900': [STRINGS_LG, 'Optimus 7 E900'],
                'LG-E900': [STRINGS_LG, 'Optimus 7 E900'],
                'LG-E900h': [STRINGS_LG, 'Optimus 7 E900'],
                'LG-C900': [STRINGS_LG, 'Optimus 7Q'],
                'LG-C900B': [STRINGS_LG, 'Quantum'],
                'LG-C900k': [STRINGS_LG, 'Quantum']
            },

            'nokia': {
                'SeaRay': ['Nokia', 'Lumia 800'],
                '800C': ['Nokia', 'Lumia 800']
            },

            'NOKIA': {
                '710': ['Nokia', 'Lumia 710'],
                'Nokia 710': ['Nokia', 'Lumia 710'],
                'Lumia 710': ['Nokia', 'Lumia 710'],
                'Lumia 719': ['Nokia', 'Lumia 719'],
                'Lumia 800': ['Nokia', 'Lumia 800'],
                '800': ['Nokia', 'Lumia 800'],
                'Lumia 900': ['Nokia', 'Lumia 900'],
                'XXX': ['Nokia', 'prototype']
            },

            'SAMSUNG': {
                'GT-I8350': [STRINGS_SAMSUNG, 'Omnia W'],
                'GT-I8350T': [STRINGS_SAMSUNG, 'Omnia W'],
                'SGH-i677': [STRINGS_SAMSUNG, 'Focus Flash'],
                'SGH-i707': [STRINGS_SAMSUNG, 'Taylor'],
                'SGH-i917': [STRINGS_SAMSUNG, 'Omnia 7'],
                'SGH-I917': [STRINGS_SAMSUNG, 'Omnia 7'],
                'SGH-i917.': [STRINGS_SAMSUNG, 'Focus'],
                'SGH-i917R': [STRINGS_SAMSUNG, 'Focus'],
                'SGH-i937': [STRINGS_SAMSUNG, 'Focus S'],
                'OMNIA7': [STRINGS_SAMSUNG, 'Omnia 7'],
                'OMINA7': [STRINGS_SAMSUNG, 'Omnia 7'],
                'Taylor': [STRINGS_SAMSUNG, 'Taylor']
            },

            'TOSHIBA': {
                'TSUNAGI': ['Toshiba', 'Tsunagi']
            }
        };

        var ANDROID_MODELS = {
            'Android': [null, null],
            'google sdk': [null, null],
            'sdk': [null, null],
            'generic': [null, null],
            'generic x86': [null, null],
            'amd brazos': ['AMD', 'Fusionbased device'],
            'Amlogic M1 reference board': ['Amlogic', 'M1 reference board'],
            'AML8726M': ['Amlogic', 'AML8726-Mbased device'],
            'vexpress a9': ['ARM', 'Versatile Express development platform'],
            'bcm7231': ['Broadcom', 'BCM7231based device', 'television'],
            'bcm7425': ['Broadcom', 'BCM7425based device', 'television'],
            'bcm7429': ['Broadcom', 'BCM7429based device', 'television'],
            'imx50 rdp': ['Freescale', 'i.MX50based device'],
            'imx51 bbg': ['Freescale', 'i.MX51based device'],
            'imx53 loco': ['Freescale', 'i.MX53based device'],
            'imx53 mp204f3': ['Freescale', 'i.MX53based device'],
            'imx53 smd': ['Freescale', 'i.MX53based device'],
            'imx53 yeagle': ['Freescale', 'i.MX53based device'],
            'imx6q': ['Freescale', 'i.MX6Qbased device'],
            'ODROID-A': ['Hardkernel', 'ODROID-A developer tablet', 'tablet'],
            'mfld dv10': ['Intel', 'Medfieldbased device'],
            'mfld dv20': ['Intel', 'Medfieldbased device'],
            'mfld lw00': ['Intel', 'Medfieldbased device'],
            'mfld pr2': ['Intel', 'Medfieldbased device'],
            'mfld pr3': ['Intel', 'Medfieldbased device'],
            'berlin bg2': ['Marvell', 'Armada 1000based device', 'television'],
            'MStar Amber3': ['MStar', 'Amber3based device'],
            'Konka Amber3': ['MStar', 'Amber3based device'],
            'mt5396': ['Mediatek', 'MT5396based device', 'television'],
            'bird75v2': ['Mediatek', 'MT6575based device'],
            'eagle75v1 2': ['Mediatek', 'MT6575based device'],
            'MBX DVBT reference board (c03ref)': ['MXB', 'DVBT reference board', 'television'],
            'NS2816': ['Nufront', 'NuSmart 2816based device'],
            'Ventana': ['nVidia', 'Tegra Ventana development kit'],
            'Cardhu': ['nVidia', 'Tegra 3based device'],
            'Panda': ['Pandaboard', 'Development Kit'],
            'pandaboard': ['Pandaboard', 'Development Kit'],
            'PandaBoard': ['Pandaboard', 'Development Kit'],
            'MSM': ['Qualcomm', 'Snapdragonbased device'],
            'msm7227 ffa': ['Qualcomm', 'Snapdragon S1based device'],
            'msm7627 surf': ['Qualcomm', 'Snapdragon S1based device'],
            'msm7627a': ['Qualcomm', 'Snapdragon S1based device'],
            'msm7627a sku1': ['Qualcomm', 'Snapdragon S1based device'],
            'msm7627a sku3': ['Qualcomm', 'Snapdragon S1based device'],
            'msm7630 fusion': ['Qualcomm', 'Snapdragon S2based device'],
            'msm7630 surf': ['Qualcomm', 'Snapdragon S2based device'],
            'msm8660 cougar': ['Qualcomm', 'Snapdragon S3based device'],
            'msm8660 surf': ['Qualcomm', 'Snapdragon S3based device'],
            'msm8960': ['Qualcomm', 'Snapdragon S4based device'],
            'rk2808sdk': ['Rockchip', 'RK2808based device'],
            'RK2818': ['Rockchip', 'RK2818based device'],
            'rk2818sdk': ['Rockchip', 'RK2818based device'],
            'Android-for-Rockchip-2818': ['Rockchip', 'RK2818based device'],
            'rk29sdk': ['Rockchip', 'RK29based device'],
            'Rk29sdk': ['Rockchip', 'RK29based device'],
            'rk30sdk': ['Rockchip', 'RK30based device'],
            's3c6410': ['Samsung', 'S3C6410based device'],
            'smdk6410': ['Samsung', 'S3C6410based device'],
            'SMDKC110': ['Samsung', 'Exynos 3110based device'],
            'SMDKV210': ['Samsung', 'Exynos 4210based device'],
            'S5PV210': ['Samsung', 'Exynos 4210based device'],
            'sec smdkc210': ['Samsung', 'Exynos 4210based device'],
            'SMDK4x12': ['Samsung', 'Exynos 4212 or 4412based device'],
            'smp86xx': ['Sigma', 'SMP86xxbased device', 'television'],
            'sv8860': ['Skyviia', 'SV8860based device', 'television'],
            'ste u8500': ['ST Ericsson', 'Novathor U8500based device'],
            'Telechips M801 Evaluation Board': ['Telechips', 'M801based device', 'television'],
            'Telechips TCC8900 Evaluation Board': ['Telechips', 'TCC8900based device', 'television'],
            'TCC8920 STB EV': ['Telechips', 'TCC8920based device', 'television'],
            'OMAP': ['Texas Instruments', 'OMAPbased device'],
            'OMAP SS': ['Texas Instruments', 'OMAPbased device'],
            'LogicPD Zoom2': ['Texas Instruments', 'OMAPbased device'],
            'omap3evm': ['Texas Instruments', 'OMAP3based device'],
            'Omap5sevm': ['Texas Instruments', 'OMAP5based device'],
            'pnx8473 kiryung': ['Trident', 'PNX8473based device', 'television'],
            'crespo': ['Google', 'Nexus S'],
            'Crespo': ['Google', 'Nexus S'],
            'Crespo4G': ['Google', 'Nexus S'],
            'Passion': ['Google', 'Nexus One'],
            'Bravo': ['HTC', 'Desire'],
            'dream': ['HTC', 'Dream'],
            'Vogue': ['HTC', 'Touch'],
            'Vendor Optimus': ['LG', 'Optimus'],
            'Stingray': ['Motorola', 'XOOM', 'tablet'],
            'Wingray': ['Motorola', 'XOOM', 'tablet'],
            'maguro': ['Samsung', 'Galaxy Nexus'],
            'Maguro': ['Samsung', 'Galaxy Nexus'],
            'Toro-VZW': ['Samsung', 'Galaxy Nexus'],
            'blaze': ['Texas Instruments', 'Blaze Tablet', 'tablet'],
            'Blaze': ['Texas Instruments', 'Blaze Tablet', 'tablet'],
            'Blaze Tablet': ['Texas Instruments', 'Blaze Tablet', 'tablet'],
            'BlueStacks': ['BlueStacks', 'App Player', 'desktop'],
            'youwave custom': ['Youwave', 'Android on PC', 'desktop'],
            'A100': ['Acer', 'Iconia Tab A100', 'tablet'],
            'A101': ['Acer', 'Iconia Tab A101', 'tablet'],
            'A200': ['Acer', 'Iconia Tab A200', 'tablet'],
            'A500': ['Acer', 'Iconia Tab A500', 'tablet'],
            'A501': ['Acer', 'Iconia Tab A501', 'tablet'],
            'A510': ['Acer', 'Iconia Tab A510', 'tablet'],
            'A511': ['Acer', 'Iconia Tab A511', 'tablet'],
            'A700': ['Acer', 'Iconia Tab A700', 'tablet'],
            'Acer A800': ['Acer', 'Iconia Tab A800', 'tablet'],
            'E110': ['Acer', 'beTouch E110'],
            'E120': ['Acer', 'beTouch E120'],
            'E130': ['Acer', 'beTouch E130'],
            'E140': ['Acer', 'beTouch E140'],
            'E210': ['Acer', 'beTouch E210'],
            'E310': ['Acer', 'Liquid mini'],
            'E320': ['Acer', 'Liquid Express'],
            'E330': ['Acer', 'Liquid Glow'],
            'E400': ['Acer', 'beTouch E400'],
            'G100W': ['Acer', 'G100W'],
            'S100': ['Acer', 'Liquid'],
            'S110': ['Acer', 'Stream'],
            'S120': ['Acer', 'Liquid mt'],
            'S300': ['Acer', 'Iconia Smart'],
            'S500': ['Acer', 'CloudMobile'],
            'TD600': ['Acer', 'beTouch TD600'],
            'Liquid': ['Acer', 'Liquid'],
            'Liquid E': ['Acer', 'Liquid E'],
            'Liquid Mt': ['Acer', 'Liquid mt'],
            'Liquid MT': ['Acer', 'Liquid mt'],
            'Liquid Metal': ['Acer', 'Liquid mt'],
            'Stream': ['Acer', 'Stream'],
            'N700': ['aigo', 'N700', 'tablet'],
            'M801': ['aigo', 'M801', 'tablet'],
            'Novo7': ['Ainovo', 'Novo7', 'tablet'],
            'Novo7 Aurora': ['Ainovo', 'Novo7 Aurora', 'tablet'],
            'Novo7 Advanced': ['Ainovo', 'Novo7 Advanced', 'tablet'],
            'Novo7 Advanced2': ['Ainovo', 'Novo7 Advanced 2', 'tablet'],
            'Novo7 Basic': ['Ainovo', 'Novo7 Basic', 'tablet'],
            'Novo7 ELF': ['Ainovo', 'Novo7 Elf', 'tablet'],
            'Novo7 PALADIN': ['Ainovo', 'Novo7 Paladin', 'tablet'],
            'Novo8 Advanced': ['Ainovo', 'Novo8 Advanced', 'tablet'],
            'one touch 890': ['Alcatel', 'One Touch 890'],
            'one touch 890D': ['Alcatel', 'One Touch 890'],
            'one touch 891': ['Alcatel', 'One Touch 891'],
            'ONE TOUCH 903': ['Alcatel', 'One Touch 903SHV-E170K'],
            'one touch 906': ['Alcatel', 'One Touch 906'],
            'one touch 908': ['Alcatel', 'One Touch 908'],
            'one touch 908F': ['Alcatel', 'One Touch 908'],
            'one touch 908S': ['Alcatel', 'One Touch 908'],
            'one touch 910': ['Alcatel', 'One Touch 910'],
            'one touch 918': ['Alcatel', 'One Touch 918'],
            'one touch 918D': ['Alcatel', 'One Touch 918'],
            'ONE TOUCH 918D': ['Alcatel', 'One Touch 918'],
            'one touch 918M': ['Alcatel', 'One Touch 918'],
            'one touch 918N': ['Alcatel', 'One Touch 918'],
            'one touch 980': ['Alcatel', 'One Touch 980'],
            'one touch 980A': ['Alcatel', 'One Touch 980'],
            'one touch 981A': ['Alcatel', 'One Touch 981'],
            'one touch 986': ['Alcatel', 'One Touch 986'],
            'one touch 990': ['Alcatel', 'One Touch 990'],
            'one touch 990A': ['Alcatel', 'One Touch 990'],
            'one touch 991': ['Alcatel', 'One Touch 991'],
            'one touch 991D': ['Alcatel', 'One Touch 991'],
            'ONE TOUCH 993': ['Alcatel', 'One Touch 993'],
            'one touch 995': ['Alcatel', 'One Touch 995'],
            'Telenor OneTouch': ['Alcatel', 'One Touch 990'],
            'OT 918': ['Alcatel', 'One Touch 918'],
            'Venture': ['Alcatel', 'Venture'],
            'Allwinner A10': ['AllWinner', 'A10', 'tablet'],
            '97FC': ['AllWinner', 'A10 97FC', 'tablet'],
            'Kindle Fire': ['Amazon', 'Kindle Fire', 'tablet'],
            'Amazon Kindle Fire': ['Amazon', 'Kindle Fire', 'tablet'],
            'AMD120': ['AnyDATA', 'AnyTAB AMD120', 'tablet'],
            'MW0811': ['AOC', 'Breeze MW0811', 'tablet'],
            'MW0821 V2.0': ['AOC', 'Breeze MW0821', 'tablet'],
            'MW0922': ['AOC', 'Breeze MW0922', 'tablet'],
            'Apanda A60': ['Apanda', 'A60'],
            'apanda-A60': ['Apanda', 'A60'],
            'A80KSC': ['Archos', 'Arnova 8', 'tablet'],
            'AN7CG2': ['Archos', 'Arnova 7', 'tablet'],
            'A101B': ['Archos', 'Arnova 10', 'tablet'],
            'AN10BG2DT': ['Archos', 'Arnova 10 B', 'tablet'],
            'AN10G2': ['Archos', 'Arnova 10 G2', 'tablet'],
            'A32': ['Archos', '32', 'media'],
            'A35DE': ['Archos', '35 Smart Home Phone'],
            'A43': ['Archos', '43', 'media'],
            'Archos5': ['Archos', '5', 'media'],
            'A70H': ['Archos', '7', 'tablet'],
            'A70HB': ['Archos', '7', 'tablet'],
            'A70BHT': ['Archos', '7', 'tablet'],
            'A70CHT': ['Archos', '7C', 'tablet'],
            'A70S': ['Archos', '70', 'tablet'],
            'A7EB': ['Archos', '70B', 'tablet'],
            'ARCHOS 70it2': ['Archos', '70 IT 2', 'tablet'],
            'ARCHOS 80G9': ['Archos', '80 G9', 'tablet'],
            'ARCHOS 101G9': ['Archos', '101 G9', 'tablet'],
            'A101IT': ['Archos', '101 IT', 'tablet'],
            'ASTRI': ['ASTRI', 'e-reader', 'ereader'],
            'eeepc': ['Asus', 'Eee Pc'],
            'asus laptop': ['Asus', 'Eee Pc'],
            'ME171': ['Asus', 'Eee Pad MeMO', 'tablet'],
            'Slider SL101': ['Asus', 'Eee Pad Slider', 'tablet'],
            'EPAD': ['Asus', 'Eee Pad Transformer', 'tablet'],
            'TF101': ['Asus', 'Eee Pad Transformer', 'tablet'],
            'Transformer TF101': ['Asus', 'Eee Pad Transformer', 'tablet'],
            'Transformer TF101G': ['Asus', 'Eee Pad Transformer', 'tablet'],
            'TF201': ['Asus', 'Eee Pad Transformer Prime', 'tablet'],
            'Transformer Prime TF201': ['Asus', 'Eee Pad Transformer Prime', 'tablet'],
            'Transformer Prime': ['Asus', 'Eee Pad Transformer Prime', 'tablet'],
            'Transformer Pad TF300T': ['Asus', 'Transformer Pad 300', 'tablet'],
            'ASUS Transformer TF300T': ['Asus', 'Transformer Pad 300', 'tablet'],
            'ASUS Transformer Pad TF300T': ['Asus', 'Transformer Pad 300', 'tablet'],
            'ASUS Transformer Pad TF300TG': ['Asus', 'Transformer Pad 300', 'tablet'],
            'ASUS Transformer Pad TF700T': ['Asus', 'Transformer Pad Infinity 700', 'tablet'],
            'ASUS Transformer Pad TF700K': ['Asus', 'Transformer Pad Infinity 700', 'tablet'],
            'ASUS Transformer TF700K': ['Asus', 'Transformer Pad Infinity 700', 'tablet'],
            'PadFone': ['Asus', 'Padfone', 'tablet'],
            'OMS TTD': ['Asus', 'Eee Pc T10'],
            'ASUS T20': ['Asus', 'Eee Pc T20'],
            'ETBW11AA': ['Asus', 'Tough'],
            'AUX V900': ['AUX', 'V900'],
            'M910A': ['AUX', 'M910'],
            'PICOpad-QGN': ['Axioo', 'Picopad QGN', 'tablet'],
            'NOOK': ['Barnes & Noble', 'NOOK', 'ereader'],
            'NookColor': ['Barnes & Noble', 'NOOK Color', 'ereader'],
            'NOOK BNRV200': ['Barnes & Noble', 'NOOK Color', 'ereader'],
            'NOOK BNRV300': ['Barnes & Noble', 'NOOK Color', 'ereader'],
            'NookTablet': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'Nook Tablet': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'NOOK BNTV250': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'NOOK BNTV250A': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'BNTV250': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'BNTV250A': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'NOOK Slate': ['Barnes & Noble', 'NOOK Tablet', 'ereader'],
            'BenWee 5100': ['BenWee', '5100'],
            'CA907AAC0G': ['Besta', 'CA907AAC0G'],
            'BM999': ['Bmorn', 'BM999', 'tablet'],
            'V11': ['Bmorn', 'V11', 'tablet'],
            'V99': ['Bmorn', 'V99', 'tablet'],
            'bq DaVinci': ['bq', 'DaVinci', 'tablet'],
            'CT704': ['Carrefour', 'CT704', 'tablet'],
            'CT1002': ['Carrefour', 'CT1002', 'tablet'],
            'Camangi-Mangrove7': ['Camangi', 'Mangrove 7', 'tablet'],
            'WS171': ['Camangi', 'WebStation', 'tablet'],
            'IS11CA': ['Casio', 'GzOne IS11CA'],
            'C771': ['Casio', 'GzOne Commando'],
            'CAT NOVA': ['Cat', 'NOVA', 'tablet'],
            'ARMM3V': ['chinaleap', 'ARMM3V', 'tablet'],
            'CIUS-7': ['Cisco', 'Cius', 'tablet'],
            'CIUS-7-AT': ['Cisco', 'Cius', 'tablet'],
            'CSL Spice MI300': ['CSL', 'Spice MI300'],
            'CSL-MI410': ['CSL', 'Spice MI410'],
            'MID1024': ['Coby', 'Kyros MID1024', 'tablet'],
            'MID1125': ['Coby', 'Kyros MID1125', 'tablet'],
            'MID1126': ['Coby', 'Kyros MID1126', 'tablet'],
            'MID7010': ['Coby', 'Kyros MID7010', 'tablet'],
            'MID7012': ['Coby', 'Kyros MID7012', 'tablet'],
            'MID7015': ['Coby', 'Kyros MID7015', 'tablet'],
            'MID7015A': ['Coby', 'Kyros MID7015', 'tablet'],
            'MID7016': ['Coby', 'Kyros MID7016', 'tablet'],
            'MID7020': ['Coby', 'Kyros MID7020', 'tablet'],
            'MID7022': ['Coby', 'Kyros MID7022', 'tablet'],
            'MID7024': ['Coby', 'Kyros MID7024', 'tablet'],
            'MID7025': ['Coby', 'Kyros MID7025', 'tablet'],
            'MID7127': ['Coby', 'Kyros MID7127', 'tablet'],
            'MID8024': ['Coby', 'Kyros MID8024', 'tablet'],
            'MID8125': ['Coby', 'Kyros MID8125', 'tablet'],
            'MID8127': ['Coby', 'Kyros MID8127', 'tablet'],
            'Z71': ['Commtiva', 'Z71'],
            'V-T100': ['Commtiva', 'V-T100'],
            'FIH-FB0': ['Commtiva', 'HD700'],
            'Coolpad D510': ['Coolpad', 'D510'],
            'Coolpad 8020': ['Coolpad', '8020'],
            'D530': ['Coolpad', 'D530'],
            'Coolpad D530': ['Coolpad', 'D530'],
            'D539': ['Coolpad', 'D539'],
            'Coolpad D539': ['Coolpad', 'D539'],
            'E239': ['Coolpad', 'E239'],
            'Coolpad E239': ['Coolpad', 'E239'],
            'Coolpad N930': ['Coolpad', 'N930'],
            'N930': ['Coolpad', 'N930'],
            'Coolpad W706': ['Coolpad', 'W706'],
            'Coolpad W706+': ['Coolpad', 'W706'],
            'Coolpad W708': ['Coolpad', 'W708'],
            'W711': ['Coolpad', 'W711'],
            'Coolpad 5010': ['Coolpad', '5010'],
            'Coolpad 5210': ['Coolpad', '5210'],
            'Coolpad 5820': ['Coolpad', '5820'],
            '5832': ['Coolpad', '5832'],
            'Coolpad 5832': ['Coolpad', '5832'],
            '5855': ['Coolpad', '5855'],
            'Coolpad 5860': ['Coolpad', '5860'],
            'Coolpad 5860+': ['Coolpad', '5860'],
            'Coolpad 5860s': ['Coolpad', '5860'],
            '5860': ['Coolpad', '5860'],
            '5860A': ['Coolpad', '5860'],
            'Coolpad 5870': ['Coolpad', '5870'],
            '5870': ['Coolpad', '5870'],
            'Coolpad 7005': ['Coolpad', '7005'],
            '7260': ['Coolpad', '7260'],
            'Coolpad 7019': ['Coolpad', '7019'],
            'Coolpad 7260': ['Coolpad', '7260'],
            'Coolpad 8013': ['Coolpad', '8013'],
            'Coolpad 8809': ['Coolpad', '8809'],
            'Coolpad 8810': ['Coolpad', '8810'],
            '8810': ['Coolpad', '8810'],
            '8150': ['Coolpad', '8150'],
            'Coolpad 8150D': ['Coolpad', '8150'],

            'Coolpad 8811': ['Coolpad', '8811'],
            'Coolpad 9900': ['Coolpad', '9900'],
            'Coolpad 8050': ['Coolpad', '8050'],
            'ZiiO7': ['Creative', 'ZiiO 7', 'tablet'],
            'ZiiLABS ZiiO7': ['Creative', 'ZiiO 7', 'tablet'],
            'ZiiLABS ZiiO10 ': ['Creative', 'ZiiO 10', 'tablet'],
            'CUBE K8GT A': ['Cube', 'K8GT A', 'tablet'],
            'CUBE K8GT B': ['Cube', 'K8GT B', 'tablet'],
            'K8GT C': ['Cube', 'K8GT C', 'tablet'],
            'K8GT H': ['Cube', 'K8GT H', 'tablet'],
            'CUBE K8GT H': ['Cube', 'K8GT H', 'tablet'],
            'K8GT W': ['Cube', 'K8GT W', 'tablet'],
            'CUBE U8GT': ['Cube', 'U8GT', 'tablet'],
            'CUBE U9GT': ['Cube', 'U9GT', 'tablet'],
            'CUBE U9GT 2': ['Cube', 'U9GT 2', 'tablet'],
            'Cube U9GT2': ['Cube', 'U9GT 2', 'tablet'],
            'U9GT': ['Cube', 'U9GT', 'tablet'],
            'U9GT2 From moage.com': ['Cube', 'U9GT 2', 'tablet'],
            'N90 From moage.com': ['Cube', 'U9GT 2', 'tablet'],
            'U9GT S': ['Cube', 'U9GT S', 'tablet'],
            'U9GT S A': ['Cube', 'U9GT SA', 'tablet'],
            'U9GTS A': ['Cube', 'U9GT SA', 'tablet'],
            'U10GT 2': ['Cube', 'U10GT 2', 'tablet'],
            'U10GT S': ['Cube', 'U10GT S', 'tablet'],
            'U30GT-H': ['Cube', 'U30GT H', 'tablet'],
            'CUBE Q7PRO': ['Cube', 'Q7 Pro', 'tablet'],
            'CUBE Q7PRO J': ['Cube', 'Q7 Pro', 'tablet'],
            'Cydle M7 (v0005.04.03.12.ko)': ['Cydle', 'M7 MultiPAD', 'tablet'],
            'Dell Aero': ['Dell', 'Aero'],
            'Dell M01M': ['Dell', 'Mini 5', 'tablet'],
            'Dell Streak': ['Dell', 'Streak', 'tablet'],
            '001DL': ['Dell', 'Streak', 'tablet'],
            '101DL': ['Dell', 'Streak Pro', 'tablet'],
            'GS01': ['Dell', 'Streak Pro', 'tablet'],
            'Dell Streak Pro': ['Dell', 'Streak Pro', 'tablet'],
            'streak7': ['Dell', 'Streak 7', 'tablet'],
            'Dell Streak 7': ['Dell', 'Streak 7', 'tablet'],
            'Dell Streak 10 Pro': ['Dell', 'Streak 10 Pro', 'tablet'],
            'Dell V04B': ['Dell', 'Streak V04B', 'tablet'],
            'Dell Venue': ['Dell', 'Venue'],
            'Dell XCD35': ['Dell', 'XCD35'],
            'XCD35': ['Dell', 'XCD35'],
            'iDx7': ['Digma', 'iDx7', 'tablet'],
            'iDx10': ['Digma', 'iDx10', 'tablet'],
            'iDx10 3G': ['Digma', 'iDx10', 'tablet'],
            'DM009SH': ['Disney Mobile', 'DM009SH'],
            'DM010SH': ['Disney Mobile', 'DM010SH'],
            'DM012SH': ['Disney Mobile', 'DM012SH'],
            'F-08D': ['Disney Mobile', 'F-08D'],
            'P-05D': ['Disney Mobile', 'P-05D'],
            'Tablet-P27': ['DracoTek', 'P27 Tablet', 'tablet'],
            'edgejr': ['EnTourage', 'Pocket eDGe', 'tablet'],
            'l97D': ['EPad', 'l97D', 'tablet'],
            'M4301': ['Eston', 'MID M4301', 'media'],
            'P10AN': ['Exper', 'Easypad P10AN', 'tablet'],
            'FIH-F0X': ['FIH', 'F0X'],
            'Fly IQ260': ['Fly', 'IQ260 BlackBird'],
            'ISW11F': ['Fujitsu', 'Arrows Z'],
            'ISW13F': ['Fujitsu', 'Arrows Z'],
            'IS12F': ['Fujitsu', 'Arrows ES'],
            'F-01D': ['Fujitsu', 'Arrows Tab LTE', 'tablet'],
            'F-03D': ['Fujitsu', 'Arrows Kiss'],
            'F-05D': ['Fujitsu', 'Arrows X LTE'],
            'F-07D': ['Fujitsu', 'Arrows \u00c3\ufffd\u00c2\u00bc'],
            'F-10D': ['Fujitsu', 'Arrows X F-10D'],
            'F-12C': ['Fujitsu', 'Globetrotter'],
            'f12arc': ['Fujitsu', 'F12arc'],
            'M532': ['Fujitsu', 'Stylistic M532', 'tablet'],
            'Garminfone': ['Garmin-Asus', 'Garminfone'],
            'Garmin-Asus A10': ['Garmin-Asus', 'Nuvifone A10'],
            'Garmin-Asus A50': ['Garmin-Asus', 'Nuvifone A50'],
            'TPA60W': ['Gateway', 'TPA60W', 'tablet'],
            'Geeksphone ZERO': ['Geeksphone', 'ZERO'],
            'gemei G2': ['Gemei', 'G2', 'tablet'],
            'Gemei G2': ['Gemei', 'G2', 'tablet'],
            'gemei G3': ['Gemei', 'G3', 'tablet'],
            'Gemei G9': ['Gemei', 'G9', 'tablet'],
            'GSmart G1317D': ['Gigabyte', 'GSmart G1317D'],
            'Gigabyte TB100': ['Gigabyte', 'TB100', 'tablet'],
            'GN100': ['Gionee', 'GN100'],
            'GN105': ['Gionee', 'GN105'],
            'GN106': ['Gionee', 'GN106'],
            'GN200': ['Gionee', 'GN200'],
            'GN205': ['Gionee', 'GN205'],
            'GN700W': ['Gionee', 'GN700W'],
            'GN708W': ['Gionee', 'GN708W'],
            'Google Ion': ['Google', 'Ion'],
            'Nexus One': ['Google', 'Nexus One'],
            'NexusOne': ['Google', 'Nexus One'],
            'HTC Nexus One': ['Google', 'Nexus One'],
            'Nexus S': ['Google', 'Nexus S'],
            'Google Nexus S': ['Google', 'Nexus S'],
            'Nexus S 4G': ['Google', 'Nexus S 4G'],
            'Dooderbutt-4.0.3-v1': ['Google', 'Nexus S 4G'],
            'Nexus 7': ['Google', 'Nexus 7', 'tablet'],
            'Haier HW-W910': ['Haier', 'HW-W910'],
            'SN10T1': ['HANNspree', 'HANNSpad SN10T1', 'tablet'],
            'SN10T2': ['HANNspree', 'HANNSpad SN10T2', 'tablet'],
            'HannsComb': ['HANNspree', 'HANNSpad', 'tablet'],
            'X1': ['HCL', 'ME X1', 'tablet'],
            'MID Serails': ['Herotab', 'C8', 'tablet'],
            'MID Serials': ['Herotab', 'C8', 'tablet'],
            'COSMO DUO': ['Hiscreen', 'Cosmo DUO', 'tablet'],
            'HS-U8': ['Hisense', 'U8'],
            'HS-T92': ['Hisense', 'T92'],
            'HS-E860': ['Hisense', 'E860'],
            'HS-E910': ['Hisense', 'E910'],
            'HS-E926': ['Hisense', 'E926'],

            'HS-EG900': ['Hisense', 'EG900'],
            'HS-ET919': ['Hisense', 'ET919'],
            'EG968B': ['Hisense', 'EG968B'],
            'HKPHONE H8-3G': ['HKPhone', 'H8 3G'],
            'HOSIN U2': ['Hosin', 'U2'],
            'Touchpad': ['HP', 'TouchPad', 'tablet'],
            'HP Touchpad': ['HP', 'TouchPad', 'tablet'],
            'cm tenderloin': ['HP', 'TouchPad', 'tablet'],
            'aokp tenderloin': ['HP', 'TouchPad', 'tablet'],
            'HTC Amaze 4G': ['HTC', 'Amaze 4G'],
            'HTC Ruby': ['HTC', 'Amaze 4G'],
            'HTC Amaze 4G(Ruby)': ['HTC', 'Amaze 4G'],
            'Amaze 4G': ['HTC', 'Amaze 4G'],
            'HTC Aria': ['HTC', 'Aria'],
            'HTC Aria A6380': ['HTC', 'Aria'],
            'HTC Liberty A6380': ['HTC', 'Aria'],
            'HTC Liberty': ['HTC', 'Aria'],
            'HTC A6366': ['HTC', 'Aria'],
            'HTC Bee': ['HTC', 'Bee'],
            'HTC ChaCha': ['HTC', 'ChaCha'],
            'HTC ChaCha A810e': ['HTC', 'ChaCha'],
            'HTC ChaChaCha A810e': ['HTC', 'ChaCha'],
            'HTC A810e': ['HTC', 'ChaCha'],
            'HTC A9188': ['HTC', 'Tianxi'],
            'HTC Bravo': ['HTC', 'Desire'],
            'HTC Desire': ['HTC', 'Desire'],
            'HTC Desire A8181': ['HTC', 'Desire'],
            'HTC Desire A8183': ['HTC', 'Desire'],
            'HTC Desire Beats A8181': ['HTC', 'Desire'],
            'HTC Desire CDMA': ['HTC', 'Desire'],
            'HTC Desire SMS': ['HTC', 'Desire'],
            'HTC Desire S.M.S': ['HTC', 'Desire'],
            'HTC Desire C': ['HTC', 'Desire C'],
            'HTC DesireHD': ['HTC', 'Desire HD'],
            'HTC DesireHD A9191': ['HTC', 'Desire HD'],
            'HTC DesireHD A9192': ['HTC', 'Desire HD'],
            'HTC Desire HD A9191': ['HTC', 'Desire HD'],
            'HTC A9191': ['HTC', 'Desire HD'],
            'HTC A9191 for AT&T': ['HTC', 'Desire HD'],
            'HTC A9192': ['HTC', 'Desire HD'],
            'HTC Desire HD': ['HTC', 'Desire HD'],
            'HTC Desire HD with Beats Audio': ['HTC', 'Desire HD'],
            'HTC Desire S': ['HTC', 'Desire S'],
            'HTC DesireS': ['HTC', 'Desire S'],
            'HTC DesiresS': ['HTC', 'Desire S'],
            'HTC DesireS S510e': ['HTC', 'Desire S'],
            'HTC DesireS S510b': ['HTC', 'Desire S'],
            'HTC Desire S S510e': ['HTC', 'Desire S'],
            'HTC S510e': ['HTC', 'Desire S'],
            'HTC Desire Saga': ['HTC', 'Desire S'],
            'HTC Desire V': ['HTC', 'Desire V'],
            'HTC T328w': ['HTC', 'Desire V'],
            'HTC Desire VC': ['HTC', 'Desire VC'],
            'HTC T328d': ['HTC', 'Desire VC'],
            'HTC T328t': ['HTC', 'Desire VT'],
            'HTC Desire Z': ['HTC', 'Desire Z'],
            'HTC DesireZ': ['HTC', 'Desire Z'],
            'HTC DesireZ A7272': ['HTC', 'Desire Z'],
            'HTC Desire Z A7272': ['HTC', 'Desire Z'],
            'HTC Vision': ['HTC', 'Desire Z'],
            'HTC A7275': ['HTC', 'Desire Z'],
            'HTC Dream': ['HTC', 'Dream'],
            'HTC S710d': ['HTC', 'Droid Incredible 2'],
            'HTC Incredible 2': ['HTC', 'Droid Incredible 2'],
            'HTC X515d': ['HTC', 'EVO 3D'],
            'HTC X515m': ['HTC', 'EVO 3D'],
            'HTC X515C': ['HTC', 'EVO 3D'],
            'HTC Evo 3D': ['HTC', 'EVO 3D'],
            'HTC EVO 3D': ['HTC', 'EVO 3D'],
            'HTC EVO 3D GSM': ['HTC', 'EVO 3D'],
            'HTC EVO 3D X515a': ['HTC', 'EVO 3D'],
            'HTC EVO 3D GSM X515m': ['HTC', 'EVO 3D'],
            'HTC EVO 3D X515m': ['HTC', 'EVO 3D'],
            'HTC EVO 3D X515M': ['HTC', 'EVO 3D'],
            'HTC EVO3D X515a': ['HTC', 'EVO 3D'],
            'HTC EVO3D X515m': ['HTC', 'EVO 3D'],
            'HTC Evo 3D X515m': ['HTC', 'EVO 3D'],
            'HTC Evo 3D with Beats Audio X515m': ['HTC', 'EVO 3D'],
            'HTC Evo 4G': ['HTC', 'EVO 4G'],
            'HTC EVO 4G': ['HTC', 'EVO 4G'],
            'HTC X515E': ['HTC', 'EVO 4G+'],
            'HTC EVO 4G+ For Sprint': ['HTC', 'EVO 4G+'],
            'HTC EVO 4G++ For Sprint': ['HTC', 'EVO 4G+'],
            'HTC C715c': ['HTC', 'EVO Design 4G'],
            'HTC Design 4G': ['HTC', 'EVO Design 4G'],
            'HTC EVO design 4G': ['HTC', 'EVO Design 4G'],
            'HTC EVO Design 4G': ['HTC', 'EVO Design 4G'],
            'HTC Evo Shift': ['HTC', 'EVO Shift'],
            'HTC EVO Shift 4G': ['HTC', 'EVO Shift'],
            'HTC A310e': ['HTC', 'Explorer'],
            'HTC Explorer': ['HTC', 'Explorer'],
            'HTC Explorer A310b': ['HTC', 'Explorer'],
            'HTC Explorer A310e': ['HTC', 'Explorer'],
            'HTC P510e': ['HTC', 'Flyer', 'tablet'],
            'HTC Flyer': ['HTC', 'Flyer', 'tablet'],
            'HTC Flyer P510e': ['HTC', 'Flyer', 'tablet'],
            'HTC Flyer P512': ['HTC', 'Flyer', 'tablet'],
            'HTC Flyer P512 NA': ['HTC', 'Flyer', 'tablet'],
            'HTC P515E': ['HTC', 'Flyer 4G', 'tablet'],
            'HTC Gratia A6380': ['HTC', 'Gratia'],
            'HTC HD': ['HTC', 'HD'],
            'HTC HD2': ['HTC', 'HD2'],
            'HTC HD2 T8585': ['HTC', 'HD2'],
            'HTC HD2(Leo)': ['HTC', 'HD2'],
            'HTC HD7': ['HTC', 'HD7'],
            'HTC T9299+': ['HTC', 'HD7'],
            'HTC HD7 for Sprint': ['HTC', 'HD7'],
            'HTC HD7 4G T9299 For AT&T': ['HTC', 'HD7'],
            'HTC HD7 4G T9299+ For AT&T': ['HTC', 'HD7'],
            'HTC T9299+ For AT&T': ['HTC', 'HD7'],
            'HTC HD7S T9399+': ['HTC', 'HD7s'],
            'HTC HD7S T9899+': ['HTC', 'HD7s'],
            'HTC T9899+ For AT&T': ['HTC', 'HD7s'],
            'VitMod ExtraLite 1.6.5.fullodex for HTC HD7 Pro': ['HTC', 'HD7 Pro'],
            'HTC Hero': ['HTC', 'Hero'],
            'HTC HERO': ['HTC', 'Hero'],
            'HTC Hero CDMA': ['HTC', 'Hero'],
            'HTC HERO CDMA': ['HTC', 'Hero'],
            'HTC HERO200': ['HTC', 'Hero 200'],
            'HTC Hero S': ['HTC', 'Hero S'],
            'HTC IMAGIO': ['HTC', 'Imagio'],
            'HTC Incredible': ['HTC', 'Incredible'],
            'HTC Incredible S710E': ['HTC', 'Incredible S'],
            'HTC S710e': ['HTC', 'Incredible S'],
            'HTC Incredible S': ['HTC', 'Incredible S'],
            'HTC Incredible S S710e': ['HTC', 'Incredible S'],
            'HTC Incredible S s710e': ['HTC', 'Incredible S'],
            'HTC IncredibleS S710e': ['HTC', 'Incredible S'],
            'HTC Incredible S with Beats Audio': ['HTC', 'Incredible S'],
            'HTC Vivo': ['HTC', 'Incredible S'],
            'HTC Innovation': ['HTC', 'Innovation'],
            'HTC Inspire 4G': ['HTC', 'Inspire 4G'],
            'HTC HD7 Inspire 4G For Vodafone': ['HTC', 'Inspire 4G'],
            'HTC P715a': ['HTC', 'Jetstream', 'tablet'],
            'HTC Legend': ['HTC', 'Legend'],
            'HTC Magic': ['HTC', 'Magic'],
            'HTC Sapphire': ['HTC', 'Magic'],
            'HTC Lexikon': ['HTC', 'Merge'],
            'HTC One S': ['HTC', 'One S'],
            'HTC Z520e': ['HTC', 'One S'],
            'HTC One V': ['HTC', 'One V'],
            'HTC T320e': ['HTC', 'One V'],
            'HTC One X': ['HTC', 'One X'],
            'HTC S720e': ['HTC', 'One X'],
            'HTC Endeavour-LS': ['HTC', 'One X'],
            'HTC One XL': ['HTC', 'One XL'],
            'HTC X710a': ['HTC', 'Raider 4G'],
            'HTC Raider': ['HTC', 'Raider 4G'],
            'HTC Raider X710e': ['HTC', 'Raider 4G'],
            'HTC Raider X710s': ['HTC', 'Raider 4G'],
            'HTC Raider 4G X710e': ['HTC', 'Raider 4G'],
            'HTC PH39100': ['HTC', 'Raider 4G'],
            'HTC Holiday': ['HTC', 'Raider 4G'],
            'HTC Velocity 4G X710s': ['HTC', 'Raider 4G'],
            'HTC Rezound': ['HTC', 'Rezound'],
            'HTC Rhyme S510b': ['HTC', 'Rhyme'],
            'HTC S510b': ['HTC', 'Rhyme'],
            'HTC Bliss': ['HTC', 'Rhyme'],
            'HTC Bliss S510b': ['HTC', 'Rhyme'],
            'HTC Salsa C510e': ['HTC', 'Salsa'],
            'HTC C510e': ['HTC', 'Salsa'],
            'HTC Z710a': ['HTC', 'Sensation'],
            'HTC Z710e': ['HTC', 'Sensation'],
            'HTC Z710t': ['HTC', 'Sensation'],
            'HTC Sensation': ['HTC', 'Sensation'],
            'HTC Sensation Z710': ['HTC', 'Sensation'],
            'HTC Sensation Z710a': ['HTC', 'Sensation'],
            'HTC Sensation Z710e': ['HTC', 'Sensation'],
            'HTC Sensation Z710E': ['HTC', 'Sensation'],
            'HTC Sensation Z710e For AT&T': ['HTC', 'Sensation'],
            'HTC Sensation Z710e with Beats Audio': ['HTC', 'Sensation'],
            'HTC Sensation with Beats Audio Z710e': ['HTC', 'Sensation'],
            'HTC Sensation with Beats Audio': ['HTC', 'Sensation'],
            'HTC Sensation Taste': ['HTC', 'Sensation'],
            'HTC Pyramid': ['HTC', 'Sensation'],
            'HTC Pyramid Z710a': ['HTC', 'Sensation'],
            'HTC Pyramid Z710e': ['HTC', 'Sensation'],
            'HTC Sensation 4G': ['HTC', 'Sensation'],
            'HTC Sensation 4G with Beats Audio': ['HTC', 'Sensation'],
            'HTC Sensation G14': ['HTC', 'Sensation'],
            'HTC Sensation G14 for AT&T': ['HTC', 'Sensation'],
            'HTC G14 sensation': ['HTC', 'Sensation'],
            'HTC Z715e': ['HTC', 'Sensation XE'],
            'HTC Sensation Z715e': ['HTC', 'Sensation XE'],
            'HTC SensationXE Beats': ['HTC', 'Sensation XE'],
            'HTC SensationXE Beats Z715a': ['HTC', 'Sensation XE'],
            'HTC SensationXE Beats Z715e': ['HTC', 'Sensation XE'],
            'HTC Sensation XE': ['HTC', 'Sensation XE'],
            'HTC Sensation XE Z715e': ['HTC', 'Sensation XE'],
            'HTC SensationXE Z715e': ['HTC', 'Sensation XE'],
            'HTC Sensation XE Beats': ['HTC', 'Sensation XE'],
            'HTC SensationXE with Beats Audio': ['HTC', 'Sensation XE'],
            'HTC Sensation XE with Beats Audio': ['HTC', 'Sensation XE'],
            'HTC Sensation XE with Beats Audio Z715a': ['HTC', 'Sensation XE'],
            'HTC Sensation Juredroid XE Beats Audio': ['HTC', 'Sensation XE'],
            'HTC Sensation XE with Beats Audio Z715e': ['HTC', 'Sensation XE'],
            'HTC Sensation XE With Beats Audio Z715e': ['HTC', 'Sensation XE'],
            'HTC Sensation 4G XE with Beats Audio': ['HTC', 'Sensation XE'],
            'HTC Sensation with Beats Audio Z715e': ['HTC', 'Sensation XE'],
            'HTC X315E': ['HTC', 'Sensation XL'],
            'HTC SensationXL Beats X315b': ['HTC', 'Sensation XL'],
            'HTC SensationXL Beats X315e': ['HTC', 'Sensation XL'],
            'HTC Sensation XL with Beats Audio X315b': ['HTC', 'Sensation XL'],
            'HTC Sensation XL with Beats Audio X315e': ['HTC', 'Sensation XL'],
            'HTC Runnymede': ['HTC', 'Sensation XL'],
            'HTC G21': ['HTC', 'Sensation XL'],
            'HTC PH06130': ['HTC', 'Status'],
            'HTC Status': ['HTC', 'Status'],
            'HTC Tattoo': ['HTC', 'Tattoo'],
            'HTC TATTOO A3288': ['HTC', 'Tattoo'],
            'HTC click': ['HTC', 'Tattoo'],
            'HTC X310e': ['HTC', 'Titan'],
            'HTC T7373': ['HTC', 'Touch Pro II'],
            'HTC ThunderBolt': ['HTC', 'ThunderBolt'],
            'HTC Mecha': ['HTC', 'ThunderBolt'],
            'HTC Velocity 4G': ['HTC', 'Velocity 4G'],
            'HTC Wildfire': ['HTC', 'Wildfire'],
            'HTC Wildfire A3333': ['HTC', 'Wildfire'],
            'HTC A3366': ['HTC', 'Wildfire'],
            'HTC A3380': ['HTC', 'Wildfire'],
            'HTC WildfireS': ['HTC', 'Wildfire S'],
            'HTC Wildfire S': ['HTC', 'Wildfire S'],
            'Htc Wildfire s': ['HTC', 'Wildfire S'],
            'HTC Wildfire S A510e': ['HTC', 'Wildfire S'],
            'HTC Wildfire S A510b': ['HTC', 'Wildfire S'],
            'HTC WildfireS A510e': ['HTC', 'Wildfire S'],
            'HTC WildfireS A510b': ['HTC', 'Wildfire S'],
            'htc wildfire s a510e': ['HTC', 'Wildfire S'],
            'HTC Wildfire S A515c': ['HTC', 'Wildfire S'],
            'HTC A510a': ['HTC', 'Wildfire S'],
            'HTC A510e': ['HTC', 'Wildfire S'],
            'HTC A510c': ['HTC', 'Wildfire S'],
            'HTCX06HT': ['HTC', 'Desire'],
            'HTC A6390': ['HTC', 'A6390'],
            'HTC A8180': ['HTC', 'A8180'],
            'HTC PG762': ['HTC', 'PG762'],
            'HTC S715e': ['HTC', 'S715e'],
            'HTC S720t': ['HTC', 'S720t'],
            'HTC Z510d': ['HTC', 'Z510d'],
            'HTC Z560e': ['HTC', 'Z560e'],
            'HTC VLE U': ['HTC', 'One S'],
            'HTC VLE#U': ['HTC', 'One S'],
            'HTC VIE U': ['HTC', 'One S'],
            'HTC EVA UL': ['HTC', 'One V'],
            'HTC ENR U': ['HTC', 'One X'],
            'ENR U': ['HTC', 'One X'],
            'EndeavorU': ['HTC', 'One X'],
            'Liberty': ['HTC', 'Aria'],
            'Desire': ['HTC', 'Desire'],
            'Desire A8181': ['HTC', 'Desire'],
            'desire hd': ['HTC', 'Desire HD'],
            'Desire HD': ['HTC', 'Desire HD'],
            'Dedire HD': ['HTC', 'Desire HD'],
            'Desire Hd (ace)': ['HTC', 'Desire HD'],
            'Desire S': ['HTC', 'Desire S'],
            'DesireS': ['HTC', 'Desire S'],
            'Desire Saga': ['HTC', 'Desire S'],
            'Desire Z': ['HTC', 'Desire Z'],
            'Dream': ['HTC', 'Dream'],
            'Droid Incredible': ['HTC', 'Droid Incredible'],
            'EVO': ['HTC', 'EVO'],
            'Evo HD2': ['HTC', 'EVO HD'],
            'Evo 3D Beats X515m': ['HTC', 'EVO 3D'],
            'Evo 3D GSM': ['HTC', 'EVO 3D'],
            'EVO 3D X515m': ['HTC', 'EVO 3D'],
            'EVO3D X515m': ['HTC', 'EVO 3D'],
            'Evo 4G': ['HTC', 'EVO 4G'],
            'EVO 4G': ['HTC', 'EVO 4G'],
            'photon': ['HTC', 'HD mini'],
            'GinDream\/GinMagic': ['HTC', 'Dream'],
            'HD2': ['HTC', 'HD2'],
            'HD7  Pro': ['HTC', 'HD7 Pro'],
            'Hero': ['HTC', 'Hero'],
            'HERO CDMA': ['HTC', 'Hero'],
            'HERO200': ['HTC', 'Hero 200'],
            'Incredible': ['HTC', 'Droid Incredible'],
            'Incredible 2': ['HTC', 'Droid Incredible 2'],
            'Incredible S': ['HTC', 'Incredible S'],
            'IncredibleS S710e': ['HTC', 'Incredible S'],
            'IncredibleS': ['HTC', 'Incredible S'],
            'Inspire HD': ['HTC', 'Inspire 4G'],
            'Inspire 4G': ['HTC', 'Inspire 4G'],
            'Legend': ['HTC', 'Legend'],
            'NexusHD2': ['HTC', 'HD2'],
            'Nexus HD2': ['HTC', 'HD2'],
            'Docomo HT-03A': ['HTC', 'Magic'],
            'MIUI.us Sensation 4G': ['HTC', 'Sensation 4G'],
            'SiRF Dream': ['HTC', 'Dream'],
            'Pyramid': ['HTC', 'Sensation'],
            'Sensation': ['HTC', 'Sensation'],
            'Sensation Z710e': ['HTC', 'Sensation'],
            'Sensation 4G': ['HTC', 'Sensation'],
            'Sensation 4g': ['HTC', 'Sensation'],
            'TripNiCE Pyramid': ['HTC', 'Sensation'],
            'SensationXE Beats Z715e': ['HTC', 'Sensation XE'],
            'SensationXL Beats X315e': ['HTC', 'Sensation XL'],
            'Click': ['HTC', 'Tattoo'],
            'Wildfire': ['HTC', 'Wildfire'],
            'Wildfire S': ['HTC', 'Wildfire S'],
            'Wildfire S A510e': ['HTC', 'Wildfire S'],
            'Sprint APX515CKT': ['HTC', 'EVO 3D'],
            'Sprint APA9292KT': ['HTC', 'EVO 4G'],
            'Sprint APA7373KT': ['HTC', 'EVO Shift 4G'],
            'Sprint APC715CKT': ['HTC', 'EVO Design 4G'],
            'A3380': ['HTC', 'Wildfire'],
            'A6277': ['HTC', 'Hero'],
            'a7272': ['HTC', 'Desire Z'],
            'A7272+(HTC DesireZ)': ['HTC', 'Desire Z'],
            'S31HT': ['HTC', 'Aria'],
            'S710d': ['HTC', 'Droid Incredible 2'],
            'S710D': ['HTC', 'Droid Incredible 2'],
            'X06HT': ['HTC', 'Desire'],
            '001HT': ['HTC', 'Desire HD'],
            'X325a': ['HTC', 'One X'],
            'Z520m': ['HTC', 'One S'],
            'Z710': ['HTC', 'Sensation'],
            'Z710e': ['HTC', 'Sensation'],
            'T9199h': ['HTC', 'T9199h'],
            'HTC S610d': ['HTC', 'S610d'],
            'ADR6200': ['HTC', 'Droid Eris'],
            'ADR6300': ['HTC', 'Droid Incredible'],
            'ADR6325VW': ['HTC', 'Merge'],
            'ADR6330VW': ['HTC', 'Rhyme'],
            'ADR6350': ['HTC', 'Droid Incredible 2'],
            'ADR6400L': ['HTC', 'Thunderbolt 4G'],
            'ADR6400L 4G': ['HTC', 'Thunderbolt 4G'],
            'ADR6410LVW 4G': ['HTC', 'Fireball'],
            'ADR6425LVW': ['HTC', 'Rezound'],
            'ADR6425LVW 4G': ['HTC', 'Rezound'],
            'Coquettish Red': ['HTC', 'Rezound'],
            'PB99400': ['HTC', 'Droid Incredible'],
            'pcdadr6350': ['HTC', 'Droid Incredible 2'],
            'PC36100': ['HTC', 'EVO 4G'],
            'PG06100': ['HTC', 'EVO Shift 4G'],
            'PG41200': ['HTC', 'EVO View 4G', 'tablet'],
            'PG86100': ['HTC', 'EVO 3D'],
            'PG8610000': ['HTC', 'EVO 3D'],
            'PH44100': ['HTC', 'EVO Design 4G'],
            'PJ83100': ['HTC', 'One X'],
            'ISW11HT': ['HTC', 'EVO 4G'],
            'ISW12HT': ['HTC', 'EVO 3D'],
            'ISW13HT': ['HTC', 'J'],
            'USCCADR6275US Carrier ID 45': ['HTC', 'Desire'],
            'USCCADR6285US': ['HTC', 'Hero S'],
            'USCCADR6325US Carrier ID 45': ['HTC', 'Merge'],
            'MediaPad': ['Huawei', 'MediaPad', 'tablet'],
            'Huawei MediaPad': ['Huawei', 'MediaPad', 'tablet'],
            'HUAWEI MediaPad': ['Huawei', 'MediaPad', 'tablet'],
            'Huawei S7-312u': ['Huawei', 'MediaPad', 'tablet'],
            'MediaPad 10 FHD': ['Huawei', 'MediaPad', 'tablet'],
            'Huawei C8500': ['Huawei', 'C8500'],
            'Huawei C8500S': ['Huawei', 'C8500'],
            'Huawei C8600': ['Huawei', 'C8600'],
            'Huawei C8650': ['Huawei', 'C8650'],
            'Huawei C8650+': ['Huawei', 'C8650'],
            'Huawei C8800': ['Huawei', 'IDEOS X5'],
            'Huawei C8810': ['Huawei', 'Ascend G300'],
            'Huawei C8812': ['Huawei', 'Ascend C8812'],
            'Huawei C8812E': ['Huawei', 'Ascend C8812'],
            'Huawei C8825D': ['Huawei', 'Ascend C8825D'],
            'Huawei C8860E': ['Huawei', 'Honor'],
            'Huawei M835': ['Huawei', 'M835'],
            'Huawei M860': ['Huawei', 'Ascend'],
            'Huawei M921': ['Huawei', 'M921'],
            'Huawei S8520': ['Huawei', 'S8520'],
            'Huawei S8600': ['Huawei', 'S8600'],
            'Huawei T8300': ['Huawei', 'T8300'],
            'Huawei T8600': ['Huawei', 'T8600'],
            'Huawei T8830': ['Huawei', 'T8830'],
            'T8830': ['Huawei', 'T8830'],
            'T8620': ['Huawei', 'T8620'],
            'Huawei T8828': ['Huawei', 'T8828'],
            'Huawei U8220': ['Huawei', 'U8220'],
            'Huawei u8500': ['Huawei', 'IDEOS X2'],
            'Huawei U8815': ['Huawei', 'Ascend G300'],
            'Huawei U8825D': ['Huawei', 'Ascend G330D'],
            'Huawei U8850': ['Huawei', 'Vision'],
            'Huawei U8652': ['Huawei', 'Sonic'],
            'Huawei U8800-51': ['Huawei', 'IDEOS X5'],
            'Huawei U8818': ['Huawei', 'Ascend G300'],
            'Huawei U9000': ['Huawei', 'Ascend X'],
            'Huawei IDEOS U8500': ['Huawei', 'IDEOS X2'],
            'Huawei IDEOS U8650': ['Huawei', 'Sonic'],
            'Huawei IDEOS X3': ['Huawei', 'IDEOS X3'],
            'Huawei Ideos X5': ['Huawei', 'IDEOS X5'],
            'Huawei Ideos X5 1.12.9(ret4rt)': ['Huawei', 'IDEOS X5'],
            'Huawei SONIC': ['Huawei', 'Sonic'],
            'Huawei 8100-9': ['Huawei', 'U8100'],
            'FUSIONideos': ['Huawei', 'IDEOS'],
            'Gnappo Ideos': ['Huawei', 'IDEOS'],
            'Ideos': ['Huawei', 'IDEOS'],
            'IDEOS X5': ['Huawei', 'IDEOS X5'],
            'Ideos S7': ['Huawei', 'IDEOS S7', 'tablet'],
            'IDEOS S7': ['Huawei', 'IDEOS S7', 'tablet'],
            'IDEOS S7 Slim': ['Huawei', 'IDEOS S7', 'tablet'],
            'Huawei S7': ['Huawei', 'IDEOS S7', 'tablet'],
            'SONIC': ['Huawei', 'Sonic'],
            'Kyivstar Aqua': ['Huawei', 'Sonic'],
            'Lucky Ultra Sonic U8650': ['Huawei', 'Sonic'],
            'Turkcell T20': ['Huawei', 'Sonic'],
            'MTC 950': ['Huawei', 'U8160'],
            'MTC 955': ['Huawei', 'Sonic'],
            'MTC Evo': ['Huawei', 'C8500'],
            'MTC Android': ['Huawei', 'U8110'],
            'S31HW': ['Huawei', 'Pocket WiFi S'],
            'S41HW': ['Huawei', 'Pocket WiFi S II'],
            '007HW': ['Huawei', 'Vision'],
            'UM840': ['Huawei', 'Evolution'],
            'M860': ['Huawei', 'Ascend'],
            'M865': ['Huawei', 'Ascend II'],
            'M886': ['Huawei', 'Glory'],
            'C8150': ['Huawei', 'IDEOS'],
            'c8500': ['Huawei', 'C8500'],
            'C8500': ['Huawei', 'C8500'],
            'C8500S': ['Huawei', 'C8500'],
            'C8600': ['Huawei', 'C8600'],
            'c8650': ['Huawei', 'C8650'],
            'C8650': ['Huawei', 'C8650'],
            'c8800': ['Huawei', 'C8800'],
            'C8800': ['Huawei', 'C8800'],
            'c8810': ['Huawei', 'Ascend G300C'],
            'C8812': ['Huawei', 'Ascend C8812'],
            'S8600': ['Huawei', 'S8600'],
            'U8100': ['Huawei', 'U8100'],
            'U8110': ['Huawei', 'U8110'],
            'u8120': ['Huawei', 'U8120'],
            'U8120': ['Huawei', 'U8120'],
            'U8180': ['Huawei', 'IDEOS X1'],
            'U8220': ['Huawei', 'Pulse'],
            'U8300': ['Huawei', 'U8300'],
            'U8350': ['Huawei', 'Boulder'],
            'U8150': ['Huawei', 'IDEOS'],
            'U8160': ['Huawei', 'U8160'],
            'U8500': ['Huawei', 'IDEOS X2'],
            'U8500 HiQQ': ['Huawei', 'U8500 HiQQ Edition'],
            'U8510': ['Huawei', 'IDEOS X3'],
            'u8650': ['Huawei', 'Sonic'],
            'U8650': ['Huawei', 'Sonic'],
            'U8650-1': ['Huawei', 'Sonic'],
            'U8660': ['Huawei', 'Sonic'],
            'u8800': ['Huawei', 'IDEOS X5'],
            'U8800': ['Huawei', 'IDEOS X5'],
            'U8800+': ['Huawei', 'IDEOS X5'],
            'U8800X': ['Huawei', 'IDEOS X5'],
            'U8800pro': ['Huawei', 'IDEOS X5 Pro'],
            'U8800PRO': ['Huawei', 'IDEOS X5 Pro'],
            'U8800Pro': ['Huawei', 'IDEOS X5 Pro'],
            'u8800pro': ['Huawei', 'IDEOS X5 Pro'],
            'U8800 Pro': ['Huawei', 'IDEOS X5 Pro'],
            'U8818': ['Huawei', 'Ascend G300'],
            'U8850': ['Huawei', 'Vision'],
            'u8860': ['Huawei', 'Honor'],
            'U8860': ['Huawei', 'Honor'],
            'U9000': ['Huawei', 'Ascend X'],
            'U9200': ['Huawei', 'Ascend P1'],
            'U9200-1': ['Huawei', 'Ascend P1'],
            'U9500': ['Huawei', 'Ascend D1'],
            'U9501L': ['Huawei', 'Ascend D LTE'],
            'U9510': ['Huawei', 'Ascend D quad'],
            'U9510E': ['Huawei', 'Ascend D quad'],
            'Comet': ['Huawei', 'Comet'],
            'GS02': ['Huawei', 'Honor'],
            'GS03': ['Huawei', 'Ascend P1'],
            'DroniX-0.5': ['Huawei', 'U8180'],
            'MTS-SP101': ['Huawei', 'C8511'],
            'TSP21': ['Huawei', 'U8110'],
            'HYUNDAI H6': ['Hyundai', 'Storm H6'],
            'iBall Slide i7011': ['iBall', 'Slide i7011'],
            'NetTAB RUNE': ['IconBit', 'NetTab Rune', 'tablet'],
            'D70W': ['Icoo', 'D70W', 'tablet'],
            'D80': ['Icoo', 'D80', 'tablet'],
            'INFOBAR A01': ['iida', 'INFOBAR A01'],
            'M009F': ['Infotmic', 'M009F'],
            'AZ210A': ['Intel', 'AZ210A'],
            'AZ210B': ['Intel', 'AZ210B'],
            'AZ510': ['Intel', 'AZ510'],
            'greenridge': ['Intel', 'Green Ridge', 'tablet'],
            'INQ Cloud Touch': ['INQ', 'Cloud Touch'],
            'ILT-MX100': ['iRiver', 'Tab', 'tablet'],
            'IVIO_DE38': ['Ivio', 'DE38'],
            'JY-G2': ['Jiayu', 'G2'],
            'JXD S601WIFI': ['JXD', 'S601 WIFI', 'media'],
            'A2': ['KakaTech', 'A2'],
            'D91': ['KK', 'D91', 'tablet'],
            'K080': ['Kobo', 'K080', 'ereader'],
            'A106': ['koobee', 'A160'],
            'KPT A9': ['KPT', 'A9'],
            'EV-S100': ['Kttech', 'Take EV-S100'],
            'KM-S120': ['Kttech', 'Take 2 KM-S120'],
            'KM-S200': ['TAKE', 'Janus KM-S200'],
            'KM-S220': ['Kttech', 'Take Tachy KM-S220'],
            'Kyobo mirasol eReader': ['Kyobo', 'eReader', 'ereader'],
            'ISW11K': ['Kyocera', 'Digno'],
            'JC-KSP8000': ['Kyocera', 'Echo'],
            'KSP8000': ['Kyocera', 'Echo'],
            'Zio': ['Kyocera', 'Zio'],
            'C5155': ['Kyocera', 'C5155'],
            'C5170': ['Kyocera', 'C5170'],
            'M9300': ['Kyocera', 'M9300'],
            'E800': ['K-Touch', 'E800'],
            'W606': ['K-Touch', 'W606'],
            'K-Touch T619': ['K-Touch', 'T619'],
            'K-Touch W619': ['K-Touch', 'W619'],
            'K-Touch W650': ['K-Touch', 'W650'],
            'W700': ['K-Touch', 'W700'],
            'W800': ['K-Touch', 'W800'],
            'W806': ['K-Touch', 'W806'],
            'W808': ['K-Touch', 'W808'],
            'W810': ['K-Touch', 'W810'],
            'X900': ['Lava', 'XOLO X900'],
            'Lenovo A798t': ['Lenovo', 'A798t'],
            'ThinkPad Tablet': ['Lenovo', 'ThinkPad Tablet', 'tablet'],
            'K1': ['Lenovo', 'IdeaPad K1', 'tablet'],
            'Ideapad S10-3T': ['Lenovo', 'IdeaPad S10-3T', 'tablet'],
            'S2005A-H': ['Lenovo', 'S2005A'],
            'IdeaTab S2007A-D': ['Lenovo', 'IdeaTab S2007A', 'tablet'],
            'IdeaTabV2007A': ['Lenovo', 'IdeaTab V2007A', 'tablet'],
            'IdeaTabV2007A-D-I': ['Lenovo', 'IdeaTab V2007A', 'tablet'],
            'IdeaTabV2010A': ['Lenovo', 'IdeaTab V2010A', 'tablet'],
            'IdeaTab A2107A-H': ['Lenovo', 'IdeaTab V2107A', 'tablet'],
            'A1 07': ['Lenovo', 'LePad', 'tablet'],
            'lepad 001b': ['Lenovo', 'LePad', 'tablet'],
            'lepad 001n': ['Lenovo', 'LePad', 'tablet'],
            '3GC101': ['Lenovo', 'LePhone 3GC101'],
            'Lenovo 3GC101': ['Lenovo', 'LePhone 3GC101'],
            '3GW100': ['Lenovo', 'LePhone 3GW100'],
            'Lenovo 3GW100': ['Lenovo', 'LePhone 3GW100'],
            '3GW101': ['Lenovo', 'LePhone 3GW101'],
            'Lenovo 3GW101': ['Lenovo', 'LePhone 3GW101'],
            'Lephone 3GW101': ['Lenovo', 'LePhone 3GW101'],
            'Lenovo A1-32AB0': ['Lenovo', 'LePhone A1-32AB0'],
            'Lenovo S1-37AH0': ['Lenovo', 'LePhone S1-37AH0'],
            'S1 37AHO': ['Lenovo', 'LePhone S1-37AH0'],
            'Lenovo S2-38AH0': ['Lenovo', 'LePhone S2-38AH0'],
            'Lenovo S2-38AT0': ['Lenovo', 'LePhone S2-38AT0'],
            'Lenovo A288t': ['Lenovo', 'LePhone A288'],
            'Lenovo A366t': ['Lenovo', 'LePhone A366'],
            'Lenovo A390e': ['Lenovo', 'LePhone A390'],
            'Lenovo A500': ['Lenovo', 'LePhone A500'],
            'Lenovo A520': ['Lenovo', 'LePhone A520'],
            'Lenovo A560e': ['Lenovo', 'A560'],
            'Lenovo A668t': ['Lenovo', 'LePhone A668'],
            'Lenovo A698t': ['Lenovo', 'LePhone A698'],
            'Lenovo A750': ['Lenovo', 'LePhone A750'],
            'Lenovo A780': ['Lenovo', 'LePhone A780'],
            'Lenovo A789': ['Lenovo', 'LePhone A789'],
            'Lenovo A790e': ['Lenovo', 'LePhone A790'],
            'Lenovo P70': ['Lenovo', 'LePhone P70'],
            'Lenovo P700': ['Lenovo', 'LePhone P700'],
            'Lenovo S850e': ['Lenovo', 'S850'],
            'Lenovo S880': ['Lenovo', 'S880'],
            'Lenovo K860': ['Lenovo', 'K860'],
            'A30t': ['Lenovo', 'A30t'],
            'Lenovo A60': ['Lenovo', 'A60'],
            'Lenovo A65': ['Lenovo', 'A65'],
            'Lenovo A66t': ['Lenovo', 'A66t'],
            'Lenovo A68e': ['Lenovo', 'A68e'],
            'Lenovo K800': ['Lenovo', 'K800'],
            'IDEA TV T100': ['Lenovo', 'IDEA TV', 'television'],
            'IDEA TV K91': ['Lenovo', 'IDEA TV', 'television'],
            'TC970': ['Le Pan', 'TC970', 'tablet'],
            'LePanII': ['Le Pan', 'II', 'tablet'],
            'LG-C555': ['LG', 'Optimus Chat'],
            'LG-C555-parrot': ['LG', 'Optimus Chat'],
            'LG-C660h': ['LG', 'Optimus Pro'],
            'LG-C729': ['LG', 'DoublePlay'],
            'LG-C800G': ['LG', 'Eclypse'],
            'LG-CX670': ['LG', 'Optimus 3G'],
            'LG-E400': ['LG', 'Optimus L3'],
            'LG-E400f': ['LG', 'Optimus L3'],
            'LG-E510': ['LG', 'Optimus Hub'],
            'LG-E510f': ['LG', 'Optimus Hub'],
            'LG-E510g': ['LG', 'Optimus Hub'],
            'LG-E610': ['LG', 'Optimus L5'],
            'LG-E612': ['LG', 'Optimus L5'],
            'LG-E612g': ['LG', 'Optimus L5'],
            'LG-E615F': ['LG', 'E615'],
            'LG-E617G': ['LG', 'E617'],
            'LG-E720': ['LG', 'Optimus Chic'],
            'LG-E720b': ['LG', 'Optimus Chic'],
            'LG-E730': ['LG', 'Optimus Sol'],
            'LG-E970': ['LG', 'Shine'],
            'LG-F100L': ['LG', 'Optimus Vu'],
            'LG-F100S': ['LG', 'Optimus Vu'],
            'LG-F120K': ['LG', 'Optimus LTE Tag'],
            'LG-F120L': ['LG', 'Optimus LTE Tag'],
            'LG-F120S': ['LG', 'Optimus LTE Tag'],
            'LG-F160K': ['LG', 'Optimus LTE II'],
            'LG-F160L': ['LG', 'Optimus LTE II'],
            'LG-F160S': ['LG', 'Optimus LTE II'],
            'LG-F180L': ['LG', 'F180L'],
            'LG-GT540': ['LG', 'Optimus'],
            'LG-GT540f': ['LG', 'Optimus'],
            'LG-GT540 Swift': ['LG', 'Optimus'],
            'LG-GW620': ['LG', 'GW620'],
            'LG-KH5200': ['LG', 'Andro-1'],
            'LG-KU3700': ['LG', 'Optimus One'],
            'LG-KU5400': ['LG', 'PRADA 3.0'],
            'LG-KU5900': ['LG', 'Optimus Black'],
            'LG-L40G': ['LG', 'L40G'],
            'LG-LG855': ['LG', 'Marquee'],
            'LG-LS670': ['LG', 'Optimus S'],
            'LG-LS696': ['LG', 'Optimus Elite'],
            'LG-LS840': ['LG', 'Viper 4G'],
            'LG-LS855': ['LG', 'Marquee'],
            'LG-LS860': ['LG', '\'Cayenne\''],
            'LG-LS970': ['LG', '\'Eclipse\''],
            'LG-LU3000': ['LG', 'Optimus Mach'],
            'LG-LU3100': ['LG', 'Optimus Chic'],
            'LG-LU3700': ['LG', 'Optimus One'],
            'LG-LU5400': ['LG', 'PRADA 3.0'],
            'LG-LU6200': ['LG', 'Optimus Q2'],
            'LG-lu6200': ['LG', 'Optimus Q2'],
            'LG-LU6500': ['LG', 'Optimus Note'],
            'LG-LU6800': ['LG', 'Optimus Big'],
            'LG-LU8300': ['LG', 'Optimus Pad LTE'],
            'LG-LW690': ['LG', 'Optimus C'],
            'LG-LW770': ['LG', 'LW770'],
            'LG-MS690': ['LG', 'Optimus M'],
            'LG-MS770': ['LG', 'MS770'],
            'LG-MS840': ['LG', 'Connect 4G'],
            'LG-MS910': ['LG', 'Esteem'],
            'LG-MS695': ['LG', 'Optimus M+'],
            'LG P350': ['LG', 'Optimus Me'],
            'LG-P350': ['LG', 'Optimus Me'],
            'LG-P350f': ['LG', 'Optimus Me'],
            'LG-P350g': ['LG', 'Optimus Me'],
            'LG-P355': ['LG', 'P355'],
            'LG-P500': ['LG', 'Optimus One'],
            'LG-P500h': ['LG', 'Optimus One'],
            'LG-P500h-parrot': ['LG', 'Optimus One'],
            'LG-P503': ['LG', 'Optimus One'],
            'LG-P504': ['LG', 'Optimus One'],
            'LG-P505': ['LG', 'Phoenix'],
            'LG-P505R': ['LG', 'Phoenix'],
            'LG-P506': ['LG', 'Thrive'],
            'LG-P509': ['LG', 'Optimus T'],
            'LG-P690': ['LG', 'Optimus Net'],
            'LG-P693': ['LG', 'P693'],
            'LG-P698': ['LG', 'Optimus Net'],
            'LG-P698f': ['LG', 'Optimus Net'],
            'LG-P700': ['LG', 'Optimus L7'],
            'LG-P705': ['LG', 'Optimus L7'],
            'LG-P705f': ['LG', 'Optimus L7'],
            'LG-P705g': ['LG', 'Optimus L7'],
            'LG-P708g': ['LG', 'P708'],
            'LG-P720': ['LG', 'Optimus Chic'],
            'LG-P720h': ['LG', 'Optimus Chic'],
            'LG-P725': ['LG', 'Optimus 3D Max'],
            'LG-P760': ['LG', 'P760'],
            'LG-P769': ['LG', 'P769'],
            'LG-P860': ['LG', 'P860'],
            'LG-P870': ['LG', 'P870'],
            'LG-P870F': ['LG', 'P870'],
            'LG-P880': ['LG', 'X3'],
            'LG-P880g': ['LG', 'X3'],
            'LG-P895': ['LG', 'P895'],
            'LG-P920': ['LG', 'Optimus 3D'],
            'LG-P920h': ['LG', 'Optimus 3D'],
            'LG-P925': ['LG', 'Thrill'],
            'LG-P925g': ['LG', 'Thrill'],
            'LG-P930': ['LG', 'Nitro HD'],
            'LG-P936': ['LG', 'Optimus LTE'],
            'LG-P940': ['LG', 'PRADA 3.0'],
            'LG-P970': ['LG', 'Optimus Black'],
            'LG-P970h': ['LG', 'Optimus Black'],
            'LG-P990': ['LG', 'Optimus 2X Speed'],
            'LG-P990h': ['LG', 'Optimus 2X Speed'],
            'LG-P990hN': ['LG', 'Optimus 2X Speed'],
            'LG-P990H': ['LG', 'Optimus 2X Speed'],
            'LG-P993': ['LG', 'Optimus 2X'],
            'LG-SU540': ['LG', 'PRADA 3.0'],
            'LG-SU640': ['LG', 'Optimus LTE'],
            'LG-SU660': ['LG', 'Optimus 2X'],
            'LG-SU760': ['LG', 'Optimus 3D'],
            'LG-SU760-Kust': ['LG', 'Optimus 3D'],
            'LG-SU870': ['LG', 'Optimus 3D Cube'],
            'LG-SU880': ['LG', 'Optimus EX'],
            'LG-US670': ['LG', 'Optimus U'],
            'LG-US730': ['LG', 'US730'],
            'LG-V900': ['LG', 'Optimus Pad', 'tablet'],
            'LG-V905R': ['LG', 'Optimus G-Slate', 'tablet'],
            'LG-V909': ['LG', 'Optimus G-Slate', 'tablet'],
            'LG-VM670': ['LG', 'Optimus V'],
            'LG-VM696': ['LG', 'Optimus Elite'],
            'LG-VM701': ['LG', 'Optimus Slider'],
            'LG-VS660': ['LG', 'Vortex'],
            'LG-VS700': ['LG', 'Enlighten'],
            'LG-VS740': ['LG', 'Ally'],
            'LG-VS840': ['LG', 'Connect 4G'],
            'LG-VS910': ['LG', 'Revolution'],
            'lgp-970': ['LG', 'Optimus Black'],
            'E900': ['LG', 'Optimus 7'],
            'GT540': ['LG', 'Optimus GT540'],
            'GW620': ['LG', 'GW620'],
            'KU9500': ['LG', 'Optimus Z'],
            'LGC660': ['LG', 'Optimus Pro'],
            'LGL45C': ['LG', 'Optimus Net'],
            'LGL55C': ['LG', 'Optimus Q'],
            'LU2300': ['LG', 'Optimus Q'],
            'LS670': ['LG', 'Optimus S'],
            'P940': ['LG', 'PRADA 3.0'],
            'P990': ['LG', 'Optimus 2X Speed'],
            'USCC-US730': ['LG', 'US730'],
            'USCC-US760': ['LG', 'Genesis'],
            'VM670': ['LG', 'Optimus V'],
            'VS840 4G': ['LG', 'Connect 4G'],
            'VS900-4G': ['LG', 'VS900'],
            'VS910 4G': ['LG', 'Revolution 4G'],
            'VS920 4G': ['LG', 'Spectrum 4G'],
            'VS930 4G': ['LG', 'VS930'],
            'VS950 4G': ['LG', 'VS950'],
            'L-01D': ['LG', 'Optimus LTE'],
            'L-02D': ['LG', 'PRADA phone'],
            'L-04C': ['LG', 'Optimus Chat'],
            'L-05D': ['LG', 'Optimus it'],
            'L-06C': ['LG', 'Optimus Pad', 'tablet'],
            'L-06D': ['LG', 'Optimus Vu'],
            'L-07C': ['LG', 'Optimus Bright'],
            'LG-Eve': ['LG', 'Eve'],
            'LG-Optimus One P500': ['LG', 'Optimus One'],
            'LG-Optimus 2X': ['LG', 'Optimus 2X'],
            'LG-GT540 Optimus': ['LG', 'Optimus'],
            'LG-Optimus Black': ['LG', 'Optimus Black'],
            'Ally': ['LG', 'Ally'],
            'Optimus': ['LG', 'Optimus'],
            'Optimus Me': ['LG', 'Optimus Me'],
            'optimus me p350': ['LG', 'Optimus Me'],
            'Optimus 2X': ['LG', 'Optimus 2X'],
            'Optimus 2x': ['LG', 'Optimus 2X'],
            'IS11LG': ['LG', 'Optimus X'],
            'Vortex': ['LG', 'Vortex'],
            'LDK-ICK v1.4': ['LG', 'Esteem'],
            'T6': ['Malata', 'Zpad T6', 'tablet'],
            'Malata SMBA1002': ['Malata', 'Tablet SMB-A1002', 'tablet'],
            'STM712HCZ': ['Mediacom', 'SmartPad 712c', 'tablet'],
            'STM803HC': ['Mediacom', 'SmartPad 810c', 'tablet'],
            'Mediacom 810C': ['Mediacom', 'SmartPad 810c', 'tablet'],
            'Smartpad810c': ['Mediacom', 'SmartPad 810c', 'tablet'],
            'SmartPad810c': ['Mediacom', 'SmartPad 810c', 'tablet'],
            'MP810C': ['Mediacom', 'SmartPad 810c', 'tablet'],
            'MP907C': ['Mediacom', 'SmartPad 907c', 'tablet'],
            'MTK6516': ['Mediatek', 'MTK6516'],
            'LIFETAB S9512': ['Medion', 'Lifetab S9512', 'tablet'],
            'LIFETAB P9514': ['Medion', 'Lifetab P9514', 'tablet'],
            'MD LIFETAB P9516': ['Medion', 'Lifetab P9516', 'tablet'],
            'MEDION LIFE P4310': ['Medion', 'Life P4310'],
            'M8': ['Meizu', 'M8'],
            'M9': ['Meizu', 'M9'],
            'M040': ['Meizu', 'M040'],
            'M9-unlocked': ['Meizu', 'M9'],
            'meizu m9': ['Meizu', 'M9'],
            'MEIZU M9': ['Meizu', 'M9'],
            'MEIZU MX': ['Meizu', 'MX'],
            'M030': ['Meizu', 'MX M030'],
            'M031': ['Meizu', 'MX M031'],
            'M032': ['Meizu', 'MX M032'],
            'Slidepad': ['Memup', 'Slidepad', 'tablet'],
            'A45': ['Micromax', 'A45 Punk'],
            'Micromax A50': ['Micromax', 'A50 Ninja'],
            'Micromax A60': ['Micromax', 'Andro A60'],
            'Micromax A70': ['Micromax', 'Andro A70'],
            'P300(Funbook)': ['Micromax', 'Funbook P300', 'tablet'],
            'AT735': ['Moinstone', 'AT735', 'tablet'],
            'A853': ['Motorola', 'Milestone'],
            'A953': ['Motorola', 'Milestone 2'],
            'A1680': ['Motorola', 'MOTO A1680'],
            'ET1': ['Motorola', 'ET1 Enterprise Tablet', 'tablet'],
            'MB200': ['Motorola', 'CLIQ'],
            'MB300': ['Motorola', 'BACKFLIP'],
            'MB501': ['Motorola', 'CLIQ XT'],
            'MB502': ['Motorola', 'CHARM'],
            'MB511': ['Motorola', 'FLIPOUT'],
            'MB520': ['Motorola', 'BRAVO'],
            'MB525': ['Motorola', 'DEFY'],
            'MB525+': ['Motorola', 'DEFY'],
            'MB525 for me': ['Motorola', 'DEFY'],
            'MB526': ['Motorola', 'DEFY+'],
            'MB611': ['Motorola', 'CLIQ 2'],
            'MB612': ['Motorola', 'XPRT'],
            'MB632': ['Motorola', 'PRO+'],
            'MB855': ['Motorola', 'PHOTON 4G'],
            'MB860': ['Motorola', 'ATRIX'],
            'MB861': ['Motorola', 'ATRIX'],
            'mb861': ['Motorola', 'ATRIX'],
            'MB865': ['Motorola', 'ATRIX 2'],
            'MB870': ['Motorola', 'Droid X2'],
            'MB886': ['Motorola', 'DINARA'],
            'ME501': ['Motorola', 'CLIQ XT'],
            'ME511': ['Motorola', 'FLIPOUT'],
            'me525': ['Motorola', 'MOTO ME525'],
            'Me525': ['Motorola', 'MOTO ME525'],
            'ME525': ['Motorola', 'MOTO ME525'],
            'ME525+': ['Motorola', 'MOTO ME525'],
            'ME600': ['Motorola', 'BACKFLIP'],
            'ME632': ['Motorola', 'PRO+'],
            'ME722': ['Motorola', 'Milestone 2'],
            'ME811': ['Motorola', 'Droid X'],
            'ME860': ['Motorola', 'ATRIX'],
            'ME863': ['Motorola', 'Milestone 3'],
            'ME865': ['Motorola', 'ATRIX 2'],
            'MT620': ['Motorola', 'MOTO MT620'],
            'MT620t': ['Motorola', 'MOTO MT620'],
            'MT716': ['Motorola', 'MOTO MT716'],
            'MT810': ['Motorola', 'MOTO MT810'],
            'MT870': ['Motorola', 'MOTO MT870'],
            'MT917': ['Motorola', 'MT917'],
            'MZ505': ['Motorola', 'XOOM Family Edition', 'tablet'],
            'MZ600': ['Motorola', 'XOOM 4G LTE', 'tablet'],
            'MZ601': ['Motorola', 'XOOM 3G', 'tablet'],
            'MZ602': ['Motorola', 'XOOM 4G LTE', 'tablet'],
            'MZ603': ['Motorola', 'XOOM 3G', 'tablet'],
            'MZ604': ['Motorola', 'XOOM WiFi', 'tablet'],
            'MZ605': ['Motorola', 'XOOM 3G', 'tablet'],
            'MZ606': ['Motorola', 'XOOM WiFi', 'tablet'],
            'MZ607': ['Motorola', 'XOOM 2 WiFi Media Edition', 'tablet'],
            'MZ609': ['Motorola', 'Droid XYBOARD 8.2', 'tablet'],
            'MZ609 4G': ['Motorola', 'Droid XYBOARD 8.2', 'tablet'],
            'MZ615': ['Motorola', 'XOOM 2 WiFi', 'tablet'],
            'MZ617': ['Motorola', 'Droid XYBOARD 10.1', 'tablet'],
            'MZ617 4G': ['Motorola', 'Droid XYBOARD 10.1', 'tablet'],
            'WX435': ['Motorola', 'TRIUMPH WX435'],
            'WX445': ['Motorola', 'CITRUS WX445'],
            'XT300': ['Motorola', 'SPICE'],
            'XT301': ['Motorola', 'MOTO XT301'],
            'XT311': ['Motorola', 'FIRE'],
            'XT316': ['Motorola', 'MOTO XT316'],
            'XT319': ['Motorola', 'MOTO XT319'],
            'XT390': ['Motorola', 'MOTO XT390'],
            'XT320': ['Motorola', 'DEFY Mini'],
            'XT321': ['Motorola', 'DEFY Mini'],
            'XT500': ['Motorola', 'MOTO XT500'],
            'xt-500': ['Motorola', 'MOTO XT500'],
            'XT502': ['Motorola', 'QUENCH XT5'],
            'XT530': ['Motorola', 'FIRE XT'],
            'XT531': ['Motorola', 'FIRE XT'],
            'XT532': ['Motorola', 'XT532'],
            'XT535': ['Motorola', 'DEFY'],
            'XT550': ['Motorola', 'XT550'],
            'XT556': ['Motorola', 'XT556'],
            'XT603': ['Motorola', 'ADMIRAL'],
            'XT610': ['Motorola', 'Droid Pro'],
            'XT615': ['Motorola', 'MOTO XT615'],
            'XT626': ['Motorola', 'MOTO XT626'],
            'XT681': ['Motorola', 'MOTO XT681'],
            'XT682': ['Motorola', 'Droid 3'],
            'XT685': ['Motorola', 'MOTO XT685'],
            'XT687': ['Motorola', 'ATRIX TV'],
            'XT701': ['Motorola', 'XT701'],
            'XT702': ['Motorola', 'MOTO XT702'],
            'XT711': ['Motorola', 'MOTO XT711'],
            'XT720': ['Motorola', 'Milestone'],
            'XT875': ['Motorola', 'Droid Bionic'],
            'XT800': ['Motorola', 'MOTO XT800'],
            'XT800+': ['Motorola', 'MOTO XT800'],
            'XT800W': ['Motorola', 'MOTO Glam'],
            'XT806': ['Motorola', 'MOTO XT806'],
            'XT860': ['Motorola', 'Milestone 3'],
            'XT862': ['Motorola', 'Droid 3'],
            'XT882': ['Motorola', 'MOTO XT882'],
            'XT883': ['Motorola', 'Milestone 3'],
            'XT889': ['Motorola', 'XT889'],
            'XT897': ['Motorola', 'Droid 4'],
            'XT901': ['Motorola', 'RAZR'],
            'XT910': ['Motorola', 'RAZR'],
            'XT910K': ['Motorola', 'RAZR'],
            'XT910S': ['Motorola', 'RAZR'],
            'XT910 4G': ['Motorola', 'RAZR'],
            'XT912': ['Motorola', 'Droid RAZR'],
            'XT923': ['Motorola', 'Droid RAZR HD'],
            'XT925': ['Motorola', 'Droid RAZR HD'],
            'XT926': ['Motorola', 'Droid RAZR'],
            'XT926 4G': ['Motorola', 'Droid RAZR'],
            'XT928': ['Motorola', 'XT928'],
            'Atrix 2': ['Motorola', 'ATRIX 2'],
            'Atrix 4g': ['Motorola', 'ATRIX 4G'],
            'Atrix 4G': ['Motorola', 'ATRIX 4G'],
            'Atrix 4G ME860': ['Motorola', 'ATRIX 4G'],
            'CLIQ': ['Motorola', 'CLIQ'],
            'CLIQ XT': ['Motorola', 'CLIQ XT'],
            'CLIQ2': ['Motorola', 'CLIQ 2'],
            'Corvair': ['Motorola', 'Corvair', 'tablet'],
            'DEFY': ['Motorola', 'DEFY'],
            'Defy+': ['Motorola', 'DEFY+'],
            'Defy Plus': ['Motorola', 'DEFY+'],
            'Devour': ['Motorola', 'Devour'],
            'Dext': ['Motorola', 'Dext'],
            'Droid': ['Motorola', 'Droid'],
            'DROID': ['Motorola', 'Droid'],
            'DROID2': ['Motorola', 'Droid 2'],
            'DROID2 GLOBAL': ['Motorola', 'Droid 2'],
            'DROID2 Global': ['Motorola', 'Droid 2'],
            'Droid2Global': ['Motorola', 'Droid 2'],
            'DROID 2': ['Motorola', 'Droid 2'],
            'DROID3': ['Motorola', 'Droid 3'],
            'DROID4': ['Motorola', 'Droid 4'],
            'DROID4 4G': ['Motorola', 'Droid 4'],
            'DROID Pro': ['Motorola', 'Droid Pro'],
            'DROID BIONIC': ['Motorola', 'Droid Bionic'],
            'DROID BIONIC 4G': ['Motorola', 'Droid Bionic'],
            'DROID BIONIC XT875 4G': ['Motorola', 'Droid Bionic'],
            'DROIDRAZR': ['Motorola', 'Droid RAZR'],
            'Droid Razr': ['Motorola', 'Droid RAZR'],
            'DROID RAZR': ['Motorola', 'Droid RAZR'],
            'DROID RAZR 4G': ['Motorola', 'Droid RAZR'],
            'DROID SPYDER': ['Motorola', 'Droid RAZR'],
            'DROID RAZR HD': ['Motorola', 'Droid RAZR HD'],
            'DROID RAZR HD 4G': ['Motorola', 'Droid RAZR HD'],
            'DroidX': ['Motorola', 'Droid X'],
            'DROIDX': ['Motorola', 'Droid X'],
            'droid x': ['Motorola', 'Droid X'],
            'Droid X': ['Motorola', 'Droid X'],
            'DROID X': ['Motorola', 'Droid X'],
            'DROID X2': ['Motorola', 'Droid X2'],
            'Electrify': ['Motorola', 'Electrify'],
            'Milestone XT720': ['Motorola', 'Milestone'],
            'Milestone Xt720': ['Motorola', 'Milestone'],
            'Milestone': ['Motorola', 'Milestone'],
            'A853 Milestone': ['Motorola', 'Milestone'],
            'Milestone X': ['Motorola', 'Milestone X'],
            'Milestone X2': ['Motorola', 'Milestone X2'],
            'MotoroiX': ['Motorola', 'Droid X'],
            'Moto Backflip': ['Motorola', 'BACKFLIP'],
            'RAZR': ['Motorola', 'RAZR'],
            'Triumph': ['Motorola', 'TRIUMPH'],
            'Opus One': ['Motorola', 'i1'],
            'Photon': ['Motorola', 'PHOTON'],
            'Photon 4G': ['Motorola', 'PHOTON 4G'],
            'XOOM': ['Motorola', 'XOOM', 'tablet'],
            'Xoom': ['Motorola', 'XOOM', 'tablet'],
            'XOOM 2': ['Motorola', 'XOOM 2', 'tablet'],
            'XOOM 2 ME': ['Motorola', 'XOOM 2', 'tablet'],
            'XOOM MZ606': ['Motorola', 'XOOM WiFi', 'tablet'],
            'ISW11M': ['Motorola', 'PHOTON'],
            'IS12M': ['Motorola', 'RAZR'],
            'MOTWX435KT': ['Motorola', 'TRIUMPH'],
            'X3-Ice MIUI XT720 Memorila Classics': ['Motorola', 'Milestone'],
            'NABI-A': ['Nabi', 'Kids tablet', 'tablet'],
            'Newpad': ['Newsmy', 'Newpad', 'tablet'],
            'Newpad-K97': ['Newsmy', 'Newpad K97', 'tablet'],
            'Newpad P9': ['Newsmy', 'Newpad P9', 'tablet'],
            'M-PAD N8': ['Newsmy', 'M-pad N8', 'tablet'],
            'LT-NA7': ['NEC', 'LT-NA7'],
            'N-01D': ['NEC', 'MEDIAS PP N-01D'],
            'N-04C': ['NEC', 'MEDIAS N-04C'],
            'N-04D': ['NEC', 'MEDIAS LTE N-04D'],
            'N-05D': ['NEC', 'MEDIAS ES N-05D'],
            'N-06C': ['NEC', 'MEDIAS WP N-06C'],
            'N-06D': ['NEC', 'MEDIAS Tab N-06D', 'tablet'],
            'N-07D': ['NEC', 'MEDIAS X N-07D'],
            '101N': ['NEC', 'MEDIAS CH Softbank 101N'],
            'IS11N': ['NEC', 'MEDIAS BR IS11N'],
            'Nexian NX-A890': ['Nexian', 'Journey'],
            'NX-A891': ['Nexian', 'Ultra Journey'],
            'M726HC': ['Nextbook', 'Premium 7', 'ereader'],
            'NXM726HN': ['Nextbook', 'Premium 7', 'ereader'],
            'NXM803HD': ['Nextbook', 'Premium 8', 'ereader'],
            'DATAM803HC': ['Nextbook', 'Premium 8', 'ereader'],
            'NXM901': ['Nextbook', 'Next 3', 'ereader'],
            'NGM Vanity Smart': ['NGM', 'Vanity Smart'],
            'Nokia N9': ['Nokia', 'N9'],
            'Nokia N900': ['Nokia', 'N900'],
            'Lumia800': ['Nokia', 'Lumia 800'],
            'Lumia 900': ['Nokia', 'Lumia 900'],
            'Notion Ink ADAM': ['Notion Ink', 'ADAM', 'tablet'],
            'P4D SIRIUS': ['Nvsbl', 'P4D SIRIUS', 'tablet'],
            'P4D Sirius': ['Nvsbl', 'P4D SIRIUS', 'tablet'],
            'EFM710A': ['Oblio', 'Mint 7x', 'tablet'],
            'ODYS-Xpress': ['Odys', 'Xpress', 'tablet'],
            'Olivetti Olipad 100': ['Olivetti', 'Olipad 100', 'tablet'],
            'OP110': ['Olivetti', 'Olipad 110', 'tablet'],
            'ONDA MID': ['Onda', 'MID', 'tablet'],
            'VX580A': ['Onda', 'VX580A', 'tablet'],
            'VX610A': ['Onda', 'VX610A', 'tablet'],
            'TQ150': ['Onda', 'TQ150'],
            'N2T': ['ONN', 'N2T', 'tablet'],
            'Renesas': ['Opad', 'Renesas', 'tablet'],
            'renesas emev': ['Opad', 'Renesas', 'tablet'],
            'X903': ['Oppo', 'Find Me X903'],
            'X905': ['Oppo', 'Find 3 X905'],
            'R805': ['Oppo', 'R805'],
            'R801': ['Oppo', 'R801'],
            'R811': ['Oppo', 'R811'],
            'X909': ['Oppo', 'X909'],
            'OPPOR801': ['Oppo', 'R801'],
            'OPPOX905': ['Oppo', 'Find 3 X905'],
            'OPPOX907': ['Oppo', 'Find 3 X907'],
            'X907': ['Oppo', 'Find 3 X907'],
            'X9015': ['Oppo', 'Find X9015'],
            'OPPOX9017': ['Oppo', 'Finder X9017'],
            'OPPOU701': ['Oppo', 'OPPOU701'],
            'OPPOR807': ['Oppo', 'Real R807'],
            'OPPOR805': ['Oppo', 'Real R805'],
            'R807': ['Oppo', 'Real R807'],
            'OPPOT703': ['Oppo', 'T703'],
            'P-01D': ['Panasonic', 'P-01D'],
            'P-02D': ['Panasonic', 'Lumix Phone'],
            'P-04D': ['Panasonic', 'Eluga'],
            'P-07C': ['Panasonic', 'P-07C'],
            'dL1': ['Panasonic', 'Eluga dL1'],
            '101P': ['Panasonic', 'Lumix Phone'],
            'JT-H580VT': ['Panasonic', 'BizPad 7', 'tablet'],
            'JT-H581VT': ['Panasonic', 'BizPad 10', 'tablet'],
            'FZ-A1A': ['Panasonic', 'Toughpad', 'tablet'],
            'pandigital9hr': ['Pandigital', '9HR', 'tablet'],
            'pandigital9hr2': ['Pandigital', '9HR2', 'tablet'],
            'pandigitalopc1': ['Pandigital', 'OPC1', 'tablet'],
            'pandigitalopp1': ['Pandigital', 'OPP1', 'tablet'],
            'pandigitalp1hr': ['Pandigital', 'p1hr', 'tablet'],
            'IM-A600S': ['Pantech', 'SIRIUS \u00c3\ufffd\u00c2\u00b1'],
            'IM-A630K': ['Pantech', 'SKY Izar'],
            'IM-A690L': ['Pantech', 'SKY'],
            'IM-A690S': ['Pantech', 'SKY'],
            'IM-A710K': ['Pantech', 'SKY Vega Xpress'],
            'IM-A720L': ['Pantech', 'SKY Vega Xpress'],
            'IM-A725L': ['Pantech', 'SKY Vega X+'],
            'IM-A730s': ['Pantech', 'SKY Vega S'],
            'IM-A730S': ['Pantech', 'SKY Vega S'],
            'IM-A750K': ['Pantech', 'SKY Mirach A'],
            'IM-A760S': ['Pantech', 'SKY Vega Racer'],
            'IM-A770K': ['Pantech', 'SKY Vega Racer'],
            'IM-A780L': ['Pantech', 'SKY Vega Racer'],
            'IM-A800S': ['Pantech', 'SKY Vega LTE'],
            'IM-A810K': ['Pantech', 'SKY Vega LTE M'],
            'IM-A810S': ['Pantech', 'SKY Vega LTE M'],
            'IM-A820L': ['Pantech', 'SKY Vega LTE EX'],
            'IM-A830K': ['Pantech', 'SKY Vega Racer 2'],
            'IM-A830L': ['Pantech', 'SKY Vega Racer 2'],
            'IM-A830S': ['Pantech', 'SKY Vega Racer 2'],
            'IM-A840S': ['Pantech', 'SKY Vega S5'],
            'IM-A850K': ['Pantech', 'IM-A850K'],
            'IM-T100K': ['Pantech', 'SKY Vega No. 5', 'tablet'],
            'IS06': ['Pantech', 'SIRIUS \u00c3\ufffd\u00c2\u00b1'],
            'ADR8995': ['Pantech', 'Breakout'],
            'ADR8995 4G': ['Pantech', 'Breakout'],
            'ADR910L 4G': ['Pantech', 'ADR910L'],
            'PantechP4100': ['Pantech', 'Element', 'tablet'],
            'PantechP8000': ['Pantech', 'Crossover'],
            'PantechP8010': ['Pantech', 'P8010'],
            'PantechP9060': ['Pantech', 'Pocket'],
            'PantechP9070': ['Pantech', 'Burst'],
            'SKY IM-A600S': ['Pantech', 'SIRIUS \u00c3\ufffd\u00c2\u00b1'],
            'SKY IM-A630K': ['Pantech', 'SKY Izar'],
            'SKY IM-A650S': ['Pantech', 'SKY Vega'],
            'IS11PT': ['Pantech', 'Mirach IS11PT'],
            'PAT712W': ['Perfeo', 'PAT712W', 'tablet'],
            'X7G': ['Pearl', 'Touchlet X7G', 'tablet'],
            'FWS810': ['PHICOMM', 'FWS810'],
            'Philips PI5000': ['Philips', 'PI5000', 'tablet'],
            'PI7000': ['Philips', 'PI7000', 'tablet'],
            'Philips W626': ['Philips', 'W626'],
            'Philips W632': ['Philips', 'W632'],
            'MOMO': ['Ployer', 'MOMO', 'tablet'],
            'MOMO15': ['Ployer', 'MOMO15', 'tablet'],
            'PocketBook A7': ['PocketBook', 'A7', 'tablet'],
            'PocketBook A10': ['PocketBook', 'A10', 'tablet'],
            'Mobii 7': ['Point Of View', 'Mobii 7', 'tablet'],
            'PMP3384BRU': ['Prestigio', 'Multipad 3384', 'tablet'],
            'TB07FTA': ['Positivo', 'TB07FTA', 'tablet'],
            'QW TB-1207': ['Qware', 'Pro3', 'tablet'],
            'W6HD ICS': ['Ramos', 'W6HD', 'tablet'],
            'w10': ['Ramos', 'W10', 'tablet'],
            'W10': ['Ramos', 'W10', 'tablet'],
            'w10 v2.0': ['Ramos', 'W10 v2.0', 'tablet'],
            'W10 V2.0': ['Ramos', 'W10 v2.0', 'tablet'],
            'T11AD': ['Ramos', 'T11AD', 'tablet'],
            'T11AD.FE': ['Ramos', 'T11AD', 'tablet'],
            'PlayBook': ['RIM', 'BlackBerry PlayBook', 'tablet'],
            'RBK-490': ['Ritmix', 'RBK-490', 'tablet'],
            'A8HD': ['Saayi', 'Dropad A8HD', 'tablet'],
            'Galaxy Nexus': ['Samsung', 'Galaxy Nexus'],
            'GT-B5330': ['Samsung', 'GT-B5330'],
            'GT-B5510': ['Samsung', 'Galaxy Y Pro'],
            'GT-B5510B': ['Samsung', 'Galaxy Y Pro'],
            'GT-B5510L': ['Samsung', 'Galaxy Y Pro'],
            'GT-B5512': ['Samsung', 'Galaxy Y Pro Duos'],
            'GT-B7510': ['Samsung', 'Galaxy Pro'],
            'GT-B7510L': ['Samsung', 'Galaxy Pro'],
            'GT-I5500': ['Samsung', 'Galaxy 5'],
            'GT-I5500B': ['Samsung', 'Galaxy 5'],
            'GT-I5500L': ['Samsung', 'Galaxy 5'],
            'GT-I5500M': ['Samsung', 'Galaxy 5'],
            'GT-I5500-MR3': ['Samsung', 'Galaxy 5'],
            'GT-I5503': ['Samsung', 'Galaxy 5'],
            'GT-I5508': ['Samsung', 'Galaxy 5'],
            'GT-I5510': ['Samsung', 'Galaxy 551'],
            'GT-I5510L': ['Samsung', 'Galaxy 551'],
            'GT-I5510M': ['Samsung', 'Galaxy 551'],
            'GT-I5510T': ['Samsung', 'Galaxy 551'],
            'GT-I5700': ['Samsung', 'Galaxy Spica'],
            'GT-I5700L': ['Samsung', 'Galaxy Spica'],
            'GT-I5800': ['Samsung', 'Galaxy Apollo'],
            'GT-I5800D': ['Samsung', 'Galaxy Apollo'],
            'GT-I5800L': ['Samsung', 'Galaxy Apollo'],
            'GT-I5801': ['Samsung', 'Galaxy Apollo'],
            'GT-I6500U': ['Samsung', 'Saturn'],
            'GT-I8000': ['Samsung', 'Omnia 2'],
            'GT-I8150': ['Samsung', 'Galaxy W'],
            'GT-I8150B': ['Samsung', 'Galaxy W'],
            'GT-I8160': ['Samsung', 'Galaxy Ace 2'],
            'GT-I8160L': ['Samsung', 'Galaxy Ace 2'],
            'GT-I8160P': ['Samsung', 'Galaxy Ace 2'],
            'GT-I8320': ['Samsung', 'H1'],
            'GT-I8520': ['Samsung', 'Galaxy Beam'],
            'GT-I8530': ['Samsung', 'Galaxy Beam'],
            'GT-I8250': ['Samsung', 'Galaxy Beam'],
            'GT-i9000': ['Samsung', 'Galaxy S'],
            'GT-I9000': ['Samsung', 'Galaxy S'],
            'GT-I9000B': ['Samsung', 'Galaxy S'],
            'GT-I9000M': ['Samsung', 'Galaxy S Vibrant'],
            'GT-I9000T': ['Samsung', 'Galaxy S'],
            'GT-I9001': ['Samsung', 'Galaxy S Plus'],
            'GT-I9003': ['Samsung', 'Galaxy SL'],
            'GT-I9003L': ['Samsung', 'Galaxy SL'],
            'GT-I9008': ['Samsung', 'Galaxy S'],
            'GT-I9008L': ['Samsung', 'Galaxy S'],
            'GT-I9010': ['Samsung', 'Galaxy S Giorgio Armani'],
            'GT-I9018': ['Samsung', 'Galaxy GT-I9018'],
            'GT-I9070': ['Samsung', 'Galaxy S Advance'],
            'GT-I9070P': ['Samsung', 'Galaxy S Advance'],
            'GT-I9082': ['Samsung', 'Galaxy Grand DUOS'],
            'GT-I9088': ['Samsung', 'Galaxy S'],
            'GT-i9100': ['Samsung', 'Galaxy S II'],
            'GT-I9100': ['Samsung', 'Galaxy S II'],
            'GT-I9100G': ['Samsung', 'Galaxy S II'],
            'GT-I9100M': ['Samsung', 'Galaxy S II'],
            'GT-I9100T': ['Samsung', 'Galaxy S II'],
            'GT-I9100P': ['Samsung', 'Galaxy S II'],
            'GT-I9103': ['Samsung', 'Galaxy R'],
            'GT-I9108': ['Samsung', 'Galaxy S II'],
            'GT-I9210': ['Samsung', 'Galaxy S II LTE'],
            'GT-I9210T': ['Samsung', 'Galaxy S II LTE'],
            'GT-I9220': ['Samsung', 'Galaxy Note'],
            'GT-I9228': ['Samsung', 'Galaxy Note'],
            'GT-I9250': ['Samsung', 'Galaxy Nexus'],
            'GT-I9250 EUR XX': ['Samsung', 'Galaxy Nexus'],
            'GT-I9260': ['Samsung', 'Galaxy Premier'],
            'GT-I9300': ['Samsung', 'Galaxy S III'],
            'GT-I9300T': ['Samsung', 'Galaxy S III'],
            'GT-I9303T': ['Samsung', 'Galaxy S III'],
            'GT-I9308': ['Samsung', 'Galaxy S III'],
            'GT-I9500': ['Samsung', 'Galaxy GT-I9500'],
            'GT-I9800': ['Samsung', 'Galaxy GT-I9800'],
            'GT-N7000': ['Samsung', 'Galaxy Note'],
            'GT-N7000B': ['Samsung', 'Galaxy Note'],
            'GT-N7100': ['Samsung', 'Galaxy Note II'],
            'GT-N7102': ['Samsung', 'Galaxy Note II'],
            'GT-N8000': ['Samsung', 'Galaxy Note 10.1'],
            'GT-N8010': ['Samsung', 'Galaxy Note 10.1'],
            'GT-P1000': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P1000L': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P1000M': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P1000N': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P1000T': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P1000 Tablet': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P1010': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GT-P3100': ['Samsung', 'Galaxy Tab 2 (7.0)', 'tablet'],
            'GT-P3100B': ['Samsung', 'Galaxy Tab 2 (7.0)', 'tablet'],
            'GT-P3110': ['Samsung', 'Galaxy Tab 2 (7.0)', 'tablet'],
            'GT-P3113': ['Samsung', 'Galaxy Tab 2 (7.0)', 'tablet'],
            'GT-P5100': ['Samsung', 'Galaxy Tab 2 (10.1)', 'tablet'],
            'GT-P5110': ['Samsung', 'Galaxy Tab 2 (10.1)', 'tablet'],
            'GT-P5113': ['Samsung', 'Galaxy Tab 2 (10.1)', 'tablet'],
            'GT-P6200': ['Samsung', 'Galaxy Tab 7.0 Plus', 'tablet'],
            'GT-P6200L': ['Samsung', 'Galaxy Tab 7.0 Plus', 'tablet'],
            'GT-P6201': ['Samsung', 'Galaxy Tab 7.0 Plus N', 'tablet'],
            'GT-P6210': ['Samsung', 'Galaxy Tab 7.0 Plus', 'tablet'],
            'GT-P6211': ['Samsung', 'Galaxy Tab 7.0 Plus N', 'tablet'],
            'GT-P6800': ['Samsung', 'Galaxy Tab 7.7', 'tablet'],
            'GT-P6810': ['Samsung', 'Galaxy Tab 7.7', 'tablet'],
            'GT-P7100': ['Samsung', 'Galaxy Tab 10.1V', 'tablet'],
            'GT-P7300': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'GT-P7300B': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'GT-P7310': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'GT-P7320': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'GT-P7320T': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'GT-P7500': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'GT-P7500D': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'GT-P7500R': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'GT-P7500V': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'GT-P7501': ['Samsung', 'Galaxy Tab 10.1N', 'tablet'],
            'GT-P7510': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'GT-P7511': ['Samsung', 'Galaxy Tab 10.1N', 'tablet'],
            'GT-S5300': ['Samsung', 'Galaxy Pocket'],
            'GT-S5360': ['Samsung', 'Galaxy Y'],
            'GT-S5360B': ['Samsung', 'Galaxy Y'],
            'GT-S5360L': ['Samsung', 'Galaxy Y'],
            'GT-S5363': ['Samsung', 'Galaxy Y'],
            'GT-S5367': ['Samsung', 'Galaxy Y TV'],
            'GT-S5368': ['Samsung', 'GT-S5368'],
            'GT-S5369': ['Samsung', 'Galaxy Y'],
            'GT-S5570': ['Samsung', 'Galaxy Mini'],
            'GT-S5570B': ['Samsung', 'Galaxy Mini'],
            'GT-S5570I': ['Samsung', 'Galaxy Mini'],
            'GT-S5570L': ['Samsung', 'Galaxy Mini'],
            'GT-S5578': ['Samsung', 'Galaxy Mini'],
            'GT-S5660': ['Samsung', 'Galaxy Gio'],
            'GT-S5660M': ['Samsung', 'Galaxy Gio'],
            'GT-S5660V': ['Samsung', 'Galaxy Gio'],
            'GT-S5670': ['Samsung', 'Galaxy Fit'],
            'GT-S5670B': ['Samsung', 'Galaxy Fit'],
            'GT-S5670L': ['Samsung', 'Galaxy Fit'],
            'GT-S5690': ['Samsung', 'Galaxy Xcover'],
            'GT-S5690L': ['Samsung', 'Galaxy Xcover'],
            'GT-S5820': ['Samsung', 'Galaxy Ace'],
            'GT-S5830': ['Samsung', 'Galaxy Ace'],
            'GT-S5830B': ['Samsung', 'Galaxy Ace'],
            'GT-S5830C': ['Samsung', 'Galaxy Ace'],
            'GT-S5830D': ['Samsung', 'Galaxy Ace'],
            'GT-S5830D-parrot': ['Samsung', 'Galaxy Ace'],
            'GT-S5830i': ['Samsung', 'Galaxy Ace'],
            'GT-S5830L': ['Samsung', 'Galaxy Ace'],
            'GT-S5830M': ['Samsung', 'Galaxy Ace'],
            'GT-S5830T': ['Samsung', 'Galaxy Ace'],
            'GT-S5838': ['Samsung', 'Galaxy Ace'],
            'GT-S5839i': ['Samsung', 'Galaxy Ace'],
            'GT-S6102': ['Samsung', 'Galaxy Y Duos'],
            'GT-S6102B': ['Samsung', 'Galaxy Y Duos'],
            'GT-S6500': ['Samsung', 'Galaxy Mini 2'],
            'GT-S6500D': ['Samsung', 'Galaxy Mini 2'],
            'GT-S6702': ['Samsung', 'GT-S6702'],
            'GT-S6802': ['Samsung', 'Galaxy Ace Duos'],
            'GT-S7500': ['Samsung', 'Galaxy Ace Plus'],
            'GT-S7500L': ['Samsung', 'Galaxy Ace Plus'],
            'GT-S7500W': ['Samsung', 'Galaxy Ace Plus'],
            'GT-T959': ['Samsung', 'Galaxy S Vibrant'],
            'SCH-i509': ['Samsung', 'Galaxy Y'],
            'SCH-i559': ['Samsung', 'Galaxy Pop'],
            'SCH-i569': ['Samsung', 'Galaxy Gio'],
            'SCH-i579': ['Samsung', 'Galaxy Ace'],
            'SCH-i589': ['Samsung', 'Galaxy Ace Duos'],
            'SCH-i705 4G': ['Samsung', 'Galaxy Tab 2 (7.0)', 'tablet'],
            'SCH-i809': ['Samsung', 'SCH-i809'],
            'SCH-i889': ['Samsung', 'Galaxy Note'],
            'SCH-i909': ['Samsung', 'Galaxy S'],
            'SCH-i919': ['Samsung', 'SCH-i919'],
            'SCH-i929': ['Samsung', 'SCH-i929'],
            'SCH-I100': ['Samsung', 'Gem'],
            'SCH-I110': ['Samsung', 'Illusion'],
            'SCH-I400': ['Samsung', 'Continuum'],
            'SCH-I405': ['Samsung', 'Stratosphere'],
            'SCH-I405 4G': ['Samsung', 'Stratosphere'],
            'SCH-I500': ['Samsung', 'Fascinate'],
            'SCH-I510': ['Samsung', 'Stealth V'],
            'SCH-I510 4G': ['Samsung', 'Droid Charge'],
            'SCH-I515': ['Samsung', 'Galaxy Nexus'],
            'SCH-I535': ['Samsung', 'Galaxy S III'],
            'SCH-I535 4G': ['Samsung', 'Galaxy S III'],
            'SCH-I619': ['Samsung', 'SCH-I619'],
            'SCH-I699': ['Samsung', 'SCH-I699'],
            'SCH-I779': ['Samsung', 'SCH-I779'],
            'SCH-I800': ['Samsung', 'Galaxy Tab 7.0', 'tablet'],
            'SCH-I815': ['Samsung', 'Galaxy Tab 7.7', 'tablet'],
            'SCH-I815 4G': ['Samsung', 'Galaxy Tab 7.7', 'tablet'],
            'SCH-I905': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SCH-I905 4G': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SCH-I909': ['Samsung', 'Galaxy S'],
            'SCH-I915': ['Samsung', 'SCH-I915'],
            'SCH-I939': ['Samsung', 'Galaxy S III'],
            'SCH-M828C': ['Samsung', 'Galaxy Precedent'],
            'SCH-M828Carray(9096483449)': ['Samsung', 'Galaxy Precedent'],
            'SCH-R530U': ['Samsung', 'Galaxy S III'],
            'SCH-R680': ['Samsung', 'Repp'],
            'SCH-R720': ['Samsung', 'Admire'],
            'SCH-R730': ['Samsung', 'Transfix'],
            'SCH-R760': ['Samsung', 'Galaxy S II'],
            'SCH-R820': ['Samsung', 'SCH-R820'],
            'SCH-R880': ['Samsung', 'Acclaim'],
            'SCH-R910': ['Samsung', 'Galaxy Indulge 4G'],
            'SCH-R915': ['Samsung', 'Galaxy Indulge'],
            'SCH-R920': ['Samsung', 'Galaxy Attain 4G'],
            'SCH-R930': ['Samsung', 'Galaxy S Aviator'],
            'SCH-R940': ['Samsung', 'Galaxy S Lightray'],
            'SCH-S720C': ['Samsung', 'Galaxy Proclaim'],
            'SCH-S735C': ['Samsung', 'SCH-S735'],
            'SCH-W899': ['Samsung', 'SCH-W899'],
            'SCH-W999': ['Samsung', 'SCH-W999'],
            'SGH-I547': ['Samsung', 'SGH-I547'],
            'SGH-I717': ['Samsung', 'Galaxy Note'],
            'SGH-I717D': ['Samsung', 'Galaxy Note'],
            'SGH-I717M': ['Samsung', 'Galaxy Note'],
            'SGH-I717R': ['Samsung', 'Galaxy Note'],
            'SGH-I727': ['Samsung', 'Galaxy S II Skyrocket'],
            'SGH-i727R': ['Samsung', 'Galaxy S II'],
            'SGH-I727R': ['Samsung', 'Galaxy S II'],
            'SGH-I747': ['Samsung', 'Galaxy S III'],
            'SGH-I747M': ['Samsung', 'Galaxy S III'],
            'SGH-I748': ['Samsung', 'Galaxy S III'],
            'SGH-I757': ['Samsung', 'Galaxy S II Skyrocket HD'],
            'SGH-I777': ['Samsung', 'Galaxy S II'],
            'SGH-I9777': ['Samsung', 'Galaxy S II'],
            'SGH-I896': ['Samsung', 'Captivate'],
            'SGH-I897': ['Samsung', 'Captivate'],
            'SGH-I927': ['Samsung', 'Captivate Glide'],
            'SGH-I927R': ['Samsung', 'Captivate Glide'],
            'SGH-I957': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'SGH-I957D': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'SGH-I957M': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'SGH-I957R': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'SGH-I987': ['Samsung', 'Galaxy Tab 7.0', 'tablet'],
            'SGH-I997': ['Samsung', 'Infuse 4G'],
            'SGH-I997R': ['Samsung', 'Infuse 4G'],
            'SGH-I9000': ['Samsung', 'Galaxy S'],
            'SGH-S730G': ['Samsung', 'SGH-S730'],
            'SGH-T499': ['Samsung', 'Dart'],
            'SGH-T499V': ['Samsung', 'Galaxy Mini'],
            'SGH-T499Y': ['Samsung', 'Galaxy Mini'],
            'SGH-T589': ['Samsung', 'Gravity Smart'],
            'SGH-T589R': ['Samsung', 'Gravity Smart'],
            'SGH-T679': ['Samsung', 'Exhibit II 4G'],
            'SGH-T679M': ['Samsung', 'Exhibit II 4G'],
            'SGH-T759': ['Samsung', 'Exhibit 4G'],
            'SGH-T769': ['Samsung', 'Galaxy S Blaze 4G'],
            'SGH-T839': ['Samsung', 'T-Mobile Sidekick'],
            'SGH-T849': ['Samsung', 'Galaxy Tab 7.0', 'tablet'],
            'SGH-T859': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SGH-T869': ['Samsung', 'Galaxy Tab 7.0 Plus', 'tablet'],
            'SGH-T879': ['Samsung', 'Galaxy Note'],
            'SGH-T959': ['Samsung', 'Vibrant'],
            'SGH-T959D': ['Samsung', 'Galaxy S Fascinate 3G+'],
            'SGH-T959P': ['Samsung', 'Galaxy S Fascinate 4G'],
            'SGH-T959V': ['Samsung', 'Galaxy S 4G'],
            'SGH-T989': ['Samsung', 'Galaxy S II'],
            'SGH-T989D': ['Samsung', 'Galaxy S II X'],
            'SGH-T999': ['Samsung', 'Galaxy S Blaze 4G'],
            'SGH-T999V': ['Samsung', 'Galaxy S Blaze 4G'],
            'SHV-E120K': ['Samsung', 'Galaxy S II HD LTE'],
            'SHV-E120L': ['Samsung', 'Galaxy S II HD LTE'],
            'SHV-E120S': ['Samsung', 'Galaxy S II HD LTE'],
            'SHV-E110S': ['Samsung', 'Galaxy S II LTE'],
            'SHV-E140S': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'SHV-E150S': ['Samsung', 'Galaxy Tab 7.7', 'tablet'],
            'SHV-E160K': ['Samsung', 'Galaxy Note'],
            'SHV-E160L': ['Samsung', 'Galaxy Note LTE'],
            'SHV-E160S': ['Samsung', 'Galaxy Note LTE'],
            'SHV-E170K': ['Samsung', 'SHV-E170K'],
            'SHV-E170L': ['Samsung', 'SHV-E170L'],
            'SHV-E210K': ['Samsung', 'Galaxy S III'],
            'SHV-E210L': ['Samsung', 'Galaxy S III'],
            'SHV-E210S': ['Samsung', 'Galaxy S III'],
            'SHW-M100S': ['Samsung', 'Galaxy A'],
            'SHW-M110S': ['Samsung', 'Galaxy S'],
            'SHW-M130L': ['Samsung', 'Galaxy U'],
            'SHW-M130K': ['Samsung', 'Galaxy K'],
            'SHW-M180K': ['Samsung', 'Galaxy Tab', 'tablet'],
            'SHW-M180L': ['Samsung', 'Galaxy Tab', 'tablet'],
            'SHW-M180S': ['Samsung', 'Galaxy Tab', 'tablet'],
            'SHW-M180W': ['Samsung', 'Galaxy Tab', 'tablet'],
            'SHW-M185S': ['Samsung', 'Galaxy Tab', 'tablet'],
            'SHW-M190S': ['Samsung', 'Galaxy S Hoppin'],
            'SHW-M220L': ['Samsung', 'Galaxy Neo'],
            'SHW-M240S': ['Samsung', 'Galaxy Ace'],
            'SHW-M250K': ['Samsung', 'Galaxy S II'],
            'SHW-M250L': ['Samsung', 'Galaxy S II'],
            'SHW-M250S': ['Samsung', 'Galaxy S II'],
            'SHW-M300W': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SHW-M305W': ['Samsung', 'Galaxy Tab 8.9', 'tablet'],
            'SHW-M340S': ['Samsung', 'Galaxy M Style'],
            'SHW-M380K': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SHW-M380S': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SHW-M380W': ['Samsung', 'Galaxy Tab 10.1', 'tablet'],
            'SHW-M440S': ['Samsung', 'Galaxy S III'],
            'SMT-i9100': ['Samsung', 'SMT-I9100', 'tablet'],
            'SPH-D600': ['Samsung', 'Conquer 4G'],
            'SPH-D700': ['Samsung', 'Epic 4G'],
            'SPH-D705': ['Samsung', 'Epic 4G 2'],
            'SPH-D710': ['Samsung', 'Epic 4G Touch'],
            'SPH-L700': ['Samsung', 'Galaxy Nexus'],
            'SPH-L710': ['Samsung', 'Galaxy S III'],
            'SPH-M820': ['Samsung', 'Galaxy Prevail'],
            'SPH-M820-BST': ['Samsung', 'Galaxy Prevail'],
            'SPH-M580': ['Samsung', 'Replenish'],
            'SPH-M900': ['Samsung', 'Moment'],
            'SPH-M910': ['Samsung', 'Intercept'],
            'SPH-M920': ['Samsung', 'Transform'],
            'SPH-M930': ['Samsung', 'Transform Ultra'],
            'SPH-M930BST': ['Samsung', 'Transform Ultra'],
            'SPH-P100': ['Samsung', 'Galaxy Tab', 'tablet'],
            'YP-GB1': ['Samsung', 'Galaxy Player', 'media'],
            'YP-GB70': ['Samsung', 'Galaxy Player 70', 'media'],
            'YP-GB70D': ['Samsung', 'Galaxy Player 70 Plus', 'media'],
            'YP-GS1': ['Samsung', 'Galaxy S WiFi 3.6', 'media'],
            'YP-G1': ['Samsung', 'Galaxy S WiFi 4.0', 'media'],
            'YP-GI1': ['Samsung', 'Galaxy S WiFi 4.2', 'media'],
            'YP-G50': ['Samsung', 'Galaxy Player', 'media'],
            'YP-G70': ['Samsung', 'Galaxy S WiFi 5.0', 'media'],
            'GT9100': ['Samsung', 'Galaxy S II'],
            'I897': ['Samsung', 'Captivate'],
            'I7500': ['Samsung', 'Galaxy'],
            'I9000': ['Samsung', 'Galaxy S'],
            'T959': ['Samsung', 'Galaxy S Vibrant'],
            'Captivate-I897': ['Samsung', 'Captivate'],
            'Galaxy': ['Samsung', 'Galaxy'],
            'Galaxy Note': ['Samsung', 'Galaxy Note'],
            'GalaxyS': ['Samsung', 'Galaxy S'],
            'Galaxy S II': ['Samsung', 'Galaxy S II'],
            'Galaxy X': ['Samsung', 'Galaxy X'],
            'Galaxy Spica': ['Samsung', 'Galaxy Spica'],
            'GALAXY Tab': ['Samsung', 'Galaxy Tab', 'tablet'],
            'GALAXY NEXUS': ['Samsung', 'Galaxy Nexus'],
            'Vibrantmtd': ['Samsung', 'Vibrant'],
            'SC-01C': ['Samsung', 'Galaxy Tab', 'tablet'],
            'SC-01D': ['Samsung', 'Galaxy Tab 10.1 LTE', 'tablet'],
            'SC-02B': ['Samsung', 'Galaxy S'],
            'SC-02C': ['Samsung', 'Galaxy S II'],
            'SC-02D': ['Samsung', 'Galaxy Tab 7.0 Plus', 'tablet'],
            'SC-03D': ['Samsung', 'Galaxy S II LTE'],
            'SC-04D': ['Samsung', 'Galaxy Nexus'],
            'SC-05D': ['Samsung', 'Galaxy Note LTE'],
            'SC-06D': ['Samsung', 'Galaxy S III'],
            'ISW11SC': ['Samsung', 'Galaxy S II WiMAX'],
            'GT-S7562': ['Samsung', 'GT-S7562'],
            'GT-S7562i': ['Samsung', 'GT-S7562i'],
            'A01SH': ['Sharp', 'A01SH'],
            'IS01': ['Sharp', 'IS01'],
            'IS03': ['Sharp', 'IS03'],
            'IS05': ['Sharp', 'IS05'],
            'IS11SH': ['Sharp', 'Aquos IS11SH'],
            'IS12SH': ['Sharp', 'Aquos IS12SH'],
            'IS13SH': ['Sharp', 'Aquos IS13SH'],
            'IS14SH': ['Sharp', 'Aquos IS14SH'],
            'ISW16SH': ['Sharp', 'Aquos ISW16SH'],
            'EB-W51GJ': ['Sharp', 'EB-W51GJ'],
            'SBM003SH': ['Sharp', 'Galapagos'],
            'SBM005SH': ['Sharp', 'Galapagos'],
            'SBM006SH': ['Sharp', 'Aquos'],
            'SBM007SH': ['Sharp', 'Aquos 007SH'],
            'SBM009SH': ['Sharp', 'Aquos 009SH'],
            'SBM102SH': ['Sharp', 'Aquos 102SH'],
            'SBM103SH': ['Sharp', 'Aquos 103SH'],
            'SBM104SH': ['Sharp', 'Aquos 104SH'],
            'SBM107SH': ['Sharp', 'Aquos 107SH'],
            'SBM107SHB': ['Sharp', 'Aquos 107SH'],
            'SH-01D': ['Sharp', 'Aquos SH-01D'],
            'SH-02D': ['Sharp', 'Aquos slider SH-02D'],
            'SH-03C': ['Sharp', 'Lynx 3D'],
            'SH-06D': ['Sharp', 'Aquos SH-06D'],
            'SH-09D': ['Sharp', 'Aquos Zeta SH-09D'],
            'SH-10B': ['Sharp', 'Lynx'],
            'SH-12C': ['Sharp', 'Aquos'],
            'SH-13C': ['Sharp', 'Aquos f SH-13C'],
            'SH80F': ['Sharp', 'Aquos SH80F'],
            'SH72x8U': ['Sharp', 'SH72x8U'],
            'SH8118U': ['Sharp', 'SH8118U'],
            'SH8128U': ['Sharp', 'SH8128U'],
            'SH8158U': ['Sharp', 'SH8158U'],
            'SH8188U': ['Sharp', 'SH8188U'],
            'SH8268U': ['Sharp', 'SH8268U'],
            'INFOBAR C01': ['Sharp', 'INFOBAR C01'],
            'SPX-5': ['Simvalley', 'SPX-5'],
            'SPX-5 3G': ['Simvalley', 'SPX-5 3G'],
            'SmartQ G7': ['SmartQ', 'G7', 'tablet'],
            'SmartQT7': ['SmartQ', 'T7', 'tablet'],
            'SmartQT10': ['SmartQ', 'T10', 'tablet'],
            'SmartQT15': ['SmartQ', 'T15', 'tablet'],
            'SmartQT19': ['SmartQ', 'T19', 'tablet'],
            'SmartQT20': ['SmartQ', 'T20', 'tablet'],
            'OMS1 6': ['Sony Ericsson', 'A8i'],
            'E10a': ['Sony Ericsson', 'Xperia X10 Mini'],
            'E10i': ['Sony Ericsson', 'Xperia X10 Mini'],
            'E10iv': ['Sony Ericsson', 'Xperia X10 Mini'],
            'E15': ['Sony Ericsson', 'Xperia X8'],
            'E15a': ['Sony Ericsson', 'Xperia X8'],
            'E15i': ['Sony Ericsson', 'Xperia X8'],
            'E15iv': ['Sony Ericsson', 'Xperia X8'],
            'E15i-o': ['Sony Ericsson', 'Xperia X8'],
            'E16i': ['Sony Ericsson', 'W8 Walkman'],
            'LT11i': ['Sony Ericsson', 'Xperia Neo V'],
            'LT15': ['Sony Ericsson', 'Xperia Arc'],
            'LT15a': ['Sony Ericsson', 'Xperia Arc'],
            'LT15i': ['Sony Ericsson', 'Xperia Arc'],
            'LT15iv': ['Sony Ericsson', 'Xperia Arc'],
            'LT15i-o': ['Sony Ericsson', 'Xperia Arc'],
            'LT18a': ['Sony Ericsson', 'Xperia Arc S'],
            'LT18i': ['Sony Ericsson', 'Xperia Arc S'],
            'LT18iv': ['Sony Ericsson', 'Xperia Arc S'],
            'LT18i-o': ['Sony Ericsson', 'Xperia Arc S'],
            'LT22i': ['Sony', 'Xperia P'],
            'LT26i': ['Sony', 'Xperia S'],
            'LT26ii': ['Sony', 'Xperia S'],
            'LT26i-o': ['Sony', 'Xperia S'],
            'LT28at': ['Sony', 'Xperia Ion'],
            'LT28h': ['Sony', 'Xperia Ion'],
            'LT28i': ['Sony', 'Xperia Ion'],
            'LT29i': ['Sony', 'Xperia GX'],
            'SonyLT29i': ['Sony', 'Xperia GX'],
            'SonyLT30a': ['Sony', 'Xperia Mint'],
            'SonyLT30p': ['Sony', 'Xperia Mint'],
            'MK16a': ['Sony Ericsson', 'Xperia Pro'],
            'MK16i': ['Sony Ericsson', 'Xperia Pro'],
            'MT11a': ['Sony Ericsson', 'Xperia Neo V'],
            'MT11i': ['Sony Ericsson', 'Xperia Neo V'],
            'MT11iv': ['Sony Ericsson', 'Xperia Neo V'],
            'MT11i-o': ['Sony Ericsson', 'Xperia Neo V'],
            'MT15a': ['Sony Ericsson', 'Xperia Neo'],
            'MT15i': ['Sony Ericsson', 'Xperia Neo'],
            'MT15iv': ['Sony Ericsson', 'Xperia Neo'],
            'MT15i-o': ['Sony Ericsson', 'Xperia Neo'],
            'MT25i': ['Sony', 'Xperia Neo L'],
            'MT27i': ['Sony', 'Xperia Sola'],
            'R800a': ['Sony Ericsson', 'Xperia Play'],
            'R800i': ['Sony Ericsson', 'Xperia Play'],
            'R800iv': ['Sony Ericsson', 'Xperia Play'],
            'R800at': ['Sony Ericsson', 'Xperia Play'],
            'R800x': ['Sony Ericsson', 'Xperia Play'],
            'SK17a': ['Sony Ericsson', 'Xperia Mini Pro'],
            'SK17i': ['Sony Ericsson', 'Xperia Mini Pro'],
            'SK17iv': ['Sony Ericsson', 'Xperia Mini Pro'],
            'SK17i-o': ['Sony Ericsson', 'Xperia Mini Pro'],
            'ST15a': ['Sony Ericsson', 'Xperia Mini'],
            'ST15i': ['Sony Ericsson', 'Xperia Mini'],
            'ST17a': ['Sony Ericsson', 'Xperia Active'],
            'ST17i': ['Sony Ericsson', 'Xperia Active'],
            'ST18a': ['Sony Ericsson', 'Xperia Ray'],
            'ST18i': ['Sony Ericsson', 'Xperia Ray'],
            'ST18iv': ['Sony Ericsson', 'Xperia Ray'],
            'ST18av': ['Sony Ericsson', 'Xperia Ray'],
            'SonyST21': ['Sony', '\'Tapioca\''],
            'SonyST21i': ['Sony', '\'Tapioca\''],
            'SonyST21a2': ['Sony', '\'Tapioca\''],
            'ST21': ['Sony', '\'Tapioca\''],
            'ST21i': ['Sony', '\'Tapioca\''],
            'SonyST23i': ['Sony', '\'Tapioca DS\''],
            'ST25i': ['Sony', 'Xperia U'],
            'ST27i': ['Sony', 'Xperia Go'],
            'U20a': ['Sony Ericsson', 'Xperia X10 Mini Pro'],
            'U20i': ['Sony Ericsson', 'Xperia X10 Mini Pro'],
            'U20iv': ['Sony Ericsson', 'Xperia X10 Mini Pro'],
            'WT13i': ['Sony Ericsson', 'Mix Walkman'],
            'WT18i': ['Sony Ericsson', 'Walkman'],
            'WT19a': ['Sony Ericsson', 'Live with Walkman'],
            'WT19i': ['Sony Ericsson', 'Live with Walkman'],
            'WT19iv': ['Sony Ericsson', 'Live with Walkman'],
            'X8': ['Sony Ericsson', 'Xperia X8'],
            'X10': ['Sony Ericsson', 'Xperia X10'],
            'X10a': ['Sony Ericsson', 'Xperia X10'],
            'X10i': ['Sony Ericsson', 'Xperia X10'],
            'X10iv': ['Sony Ericsson', 'Xperia X10'],
            'X10S': ['Sony Ericsson', 'Xperia X10'],
            'X10mini': ['Sony Ericsson', 'Xperia X10 Mini'],
            'X10 Mini': ['Sony Ericsson', 'Xperia X10 Mini'],
            'X10 Mini Pro': ['Sony Ericsson', 'Xperia X10 Mini Pro'],
            'Z1i': ['Sony Ericsson', 'Xperia Play'],
            'S51SE': ['Sony Ericsson', 'Xperia Mini'],
            'IS11S': ['Sony Ericsson', 'Xperia Acro'],
            'IS12S': ['Sony Ericsson', 'Xperia Acro HD'],
            'SO-01B': ['Sony Ericsson', 'Xperia X10'],
            'SO-01C': ['Sony Ericsson', 'Xperia Arc'],
            'SO-01D': ['Sony Ericsson', 'Xperia Play'],
            'SO-02C': ['Sony Ericsson', 'Xperia Acro'],
            'SO-02D': ['Sony Ericsson', 'Xperia NX'],
            'SO-03C': ['Sony Ericsson', 'Xperia Ray'],
            'SO-03D': ['Sony Ericsson', 'Xperia Acro HD'],
            'SO-04D': ['Sony', 'Xperia GX'],
            'SO-05D': ['Sony', 'Xperia SX'],
            'XPERIA X8': ['Sony Ericsson', 'Xperia X8'],
            'Xperia X8': ['Sony Ericsson', 'Xperia X8'],
            'Xperia X10': ['Sony Ericsson', 'Xperia X10'],
            'Xperia ray': ['Sony Ericsson', 'Xperia Ray'],
            'Xperia Ray': ['Sony Ericsson', 'Xperia Ray'],
            'Xperia Arc': ['Sony Ericsson', 'Xperia Arc'],
            'Xperia Mini': ['Sony Ericsson', 'Xperia Mini'],
            'Xperia neo': ['Sony Ericsson', 'Xperia Neo'],
            'Xperia Neo': ['Sony Ericsson', 'Xperia Neo'],
            'XPERIA NEO': ['Sony Ericsson', 'Xperia Neo'],
            'Xperia NeoV': ['Sony Ericsson', 'Xperia Neo V'],
            'Xperia Neo V': ['Sony Ericsson', 'Xperia Neo V'],
            'Xperia Play': ['Sony Ericsson', 'Xperia Play'],
            'Sony Ericsson Xperia X1': ['Sony Ericsson', 'Xperia X1'],
            'SonyHayabusa': ['Sony', 'Xperia Ion'],
            'Hayabusa': ['Sony', 'Xperia Ion'],
            'nozomi': ['Sony', 'Xperia S'],
            'Sony Tablet P': ['Sony', 'Tablet P', 'tablet'],
            'Sony Tablet S': ['Sony', 'Tablet S', 'tablet'],
            'NWZ-Z1000Series': ['Sony', 'Walkman Z', 'media'],
            'NW-Z1000Series': ['Sony', 'Walkman Z', 'media'],
            'Spice Mi280': ['Spice', 'Mi-280'],
            'Spice Mi300': ['Spice', 'Mi-300'],
            'Spice Mi-310': ['Spice', 'Mi-310'],
            'Spice Mi-425': ['Spice', 'Mi-425'],
            'SPICE Mi-720': ['Spice', 'Mi-720'],
            'A7272+': ['Star', 'A7272+'],
            'e1109 v73 gq1002 ctp': ['Star', 'X18i'],
            'TS1004T': ['Surf 3Q', 'TS1004T', 'tablet'],
            'SYTABEX7-2': ['Sylvania', 'SYTABEX7', 'tablet'],
            'TCL A860': ['TCL', 'A860'],
            'TCL A906': ['TCL', 'A906'],
            'TCL A909': ['TCL', 'A909'],
            'TCL A919': ['TCL', 'A919'],
            'TCL A990': ['TCL', 'A990'],
            'TCL A996': ['TCL', 'A996'],
            'TCL A998': ['TCL', 'A998'],
            'TCL GENESEE E708': ['TCL', 'Genesee E708'],
            'A10t(5DM3)': ['Teclast', 'A10T', 'tablet'],
            'P72': ['Teclast', 'P72', 'tablet'],
            'P76TI': ['Teclast', 'P76Ti', 'tablet'],
            'P81HD': ['Teclast', 'P81HD', 'tablet'],
            'P85(R8A1)': ['Teclast', 'P85', 'tablet'],
            'T720 SE': ['Teclast', 'T720', 'tablet'],
            'T760 from moage.com': ['Teclast', 'T760', 'tablet'],
            'tegav2': ['Tegatech', 'TEGA v2', 'tablet'],
            'TM-7025': ['teXet', 'TM-7025', 'tablet'],
            'MoFing': ['Thomson', 'MoFing', 'tablet'],
            'Ultimate10': ['Tomtec', 'Ultimate10', 'tablet'],
            'Thl V7': ['THL', 'V7'],
            'ThL V7': ['THL', 'V7'],
            'ThL V8': ['THL', 'V8'],
            'ThL V9': ['THL', 'V9'],
            'ThL V11': ['THL', 'V11'],
            'TSB CLOUD COMPANION;TOSHIBA AC AND AZ': ['Toshiba', 'Dynabook AZ', 'desktop'],
            'TOSHIBA AC AND AZ': ['Toshiba', 'Dynabook AZ', 'desktop'],
            'TOSHIBA FOLIO AND A': ['Toshiba', 'Folio 100', 'tablet'],
            'T-01C': ['Toshiba', 'Regza T-01C'],
            'T-01D': ['Toshiba', 'Regza T-01D'],
            'IS04': ['Toshiba', 'Regza IS04'],
            'IS11T': ['Toshiba', 'Regza IS11T'],
            'AT1S0': ['Toshiba', 'Regza AT1S0'],
            'Tostab03': ['Toshiba', 'Regza AT100', 'tablet'],
            'AT100': ['Toshiba', 'Regza AT100', 'tablet'],
            'AT200': ['Toshiba', 'Regza AT200', 'tablet'],
            'AT470': ['Toshiba', 'Regza AT470', 'tablet'],
            'AT570': ['Toshiba', 'Regza AT570', 'tablet'],
            'AT830': ['Toshiba', 'Regza AT830', 'tablet'],
            'Folio 100': ['Toshiba', 'Folio 100', 'tablet'],
            'folio100': ['Toshiba', 'Folio 100', 'tablet'],
            'THRiVE': ['Toshiba', 'THRiVE', 'tablet'],
            'Fantastic T3': ['TWM', 'Fantastic T3'],
            'M70014': ['United Star Technology', 'M70014', 'tablet'],
            'PS47': ['Velocity Micro', 'Cruz PS47', 'tablet'],
            'T301': ['Velocity Micro', 'Cruz T301', 'tablet'],
            'Vibo-A688': ['FIH', 'Vibo A688'],
            'Videocon-V7500': ['Videocon', 'V7500'],
            'GTablet': ['ViewSonic', 'gTablet', 'tablet'],
            'GtabComb': ['ViewSonic', 'gTablet', 'tablet'],
            'TeamDRH ICS for GTablet': ['ViewSonic', 'gTablet', 'tablet'],
            'ViewPad7': ['ViewSonic', 'ViewPad 7', 'tablet'],
            'ViewPad 10e': ['ViewSonic', 'ViewPad 10e', 'tablet'],
            'VTAB1008': ['Vizio', 'VTAB1008', 'tablet'],
            'VTAB3010': ['Vizio', 'VTAB3010', 'tablet'],
            'VOTO W5300': ['VOTO', 'W5300'],
            'xPAD-70': ['WayteQ', 'xPAD-70', 'tablet'],
            'xTAB-70': ['WayteQ', 'xTAB-70', 'tablet'],
            'WellcoM-A99': ['WellcoM', 'A99'],
            'N12': ['Window', 'N12', 'tablet'],
            'N12R': ['Window', 'N12R', 'tablet'],
            'N50': ['Window', 'N50', 'tablet'],
            'N50DT': ['Window', 'N50DT', 'tablet'],
            'N50GT': ['Window', 'N50GT', 'tablet'],
            'N50GT A': ['Window', 'N50GT-A', 'tablet'],
            'N70': ['Window', 'N70', 'tablet'],
            'N70 DUAL CORE': ['Window', 'N70 Dual Core', 'tablet'],
            'N80': ['Window', 'N80', 'tablet'],
            'N90': ['Window', 'N90', 'tablet'],
            'N90 DUAL CORE2 V12': ['Window', 'N90 Dual Core', 'tablet'],
            'N612': ['Wishway', 'N612'],
            'AT-AS43D': ['Wolfgang', 'AT-AS43D'],
            'M12': ['Wopad', 'M12', 'tablet'],
            'WM8650': ['WonderMedia', 'WM8650', 'tablet'],
            'MI-ONE': ['Xiaomi', 'MI-ONE'],
            'MI-ONE C1': ['Xiaomi', 'MI-ONE C1'],
            'MI-ONE Plus': ['Xiaomi', 'MI-ONE Plus'],
            'MI 1S': ['Xiaomi', 'MI-ONE Plus'],
            'MI 1SC': ['Xiaomi', 'MI-ONE 1SC'],
            'mione plus': ['Xiaomi', 'MI-ONE Plus'],
            'MI-TWO': ['Xiaomi', 'MI-TWO'],
            'MI 2': ['Xiaomi', 'MI-TWO'],
            'MI 2S': ['Xiaomi', 'MI-TWO Plus'],
            'MI 2SC': ['Xiaomi', 'MI-TWO Plus'],
            'Q07CL01': ['XVision', 'Q07', 'tablet'],
            'N6': ['Yarvik', '210 Tablet', 'tablet'],
            'EMR1879': ['Yidong', 'EMR1879', 'tablet'],
            'yusun W702': ['Yusun', 'W702'],
            'YX-YUSUN E80': ['Yusun', 'E80'],
            'zt180': ['Zenithink', 'ZT-180', 'tablet'],
            'Jaguar7': ['ZiiLabs', 'Jaguar 7', 'tablet'],
            'Ziss Ranger HD': ['Ziss', 'Ranger HD'],
            'ZTE Libra': ['ZTE', 'Libra'],
            'ZTE-T T9': ['ZTE', 'Light Tab T9', 'tablet'],
            'V9': ['ZTE', 'Light Tab V9', 'tablet'],
            'V9e+': ['ZTE', 'Light Tab 2', 'tablet'],
            'V9A': ['ZTE', 'Light Tab 2', 'tablet'],
            'Light Tab 2W': ['ZTE', 'Light Tab 2', 'tablet'],
            'Light Tab 2': ['ZTE', 'Light Tab 2', 'tablet'],
            'V9C': ['ZTE', 'Light Tab 3', 'tablet'],
            'V55': ['ZTE', 'Optik', 'tablet'],
            'Acqua': ['ZTE', 'Acqua'],
            'Blade': ['ZTE', 'Blade'],
            'Blade-V880': ['ZTE', 'Blade'],
            'ZTE-U V880': ['ZTE', 'Blade'],
            'Blade-opda': ['ZTE', 'Blade'],
            'ZTE-BLADE': ['ZTE', 'Blade'],
            'ZTE Blade': ['ZTE', 'Blade'],
            'ZTE V880': ['ZTE', 'Blade'],
            'ZTE-U(V)880+': ['ZTE', 'Blade'],
            'V880': ['ZTE', 'Blade'],
            'a5': ['ZTE', 'Blade'],
            'Blade2': ['ZTE', 'Blade 2'],
            'Blade S': ['ZTE', 'Blade S'],
            'X500': ['ZTE', 'Score'],
            'ZTE-X500': ['ZTE', 'Score'],
            'Skate': ['ZTE', 'Skate'],
            'ZTE Skate': ['ZTE', 'Skate'],
            'ZTE-Skate': ['ZTE', 'Skate'],
            'ZTE-SKATE': ['ZTE', 'Skate'],
            'ZTE-V960': ['ZTE', 'Skate'],
            'ZTE-U V960': ['ZTE', 'Skate'],
            'ZTE Racer': ['ZTE', 'Racer'],
            'ZTE-RACER': ['ZTE', 'Racer'],
            'MTC 916': ['ZTE', 'Racer'],
            'Racer': ['ZTE', 'Racer'],
            'RacerII': ['ZTE', 'Racer 2'],
            'RACERII': ['ZTE', 'Racer 2'],
            'ZTE Roamer': ['ZTE', 'Roamer'],
            'N860': ['ZTE', 'Warp'],
            'N880': ['ZTE', 'Blade'],
            'ZTE-T U802': ['ZTE', 'T-U802'],
            'ZTE-T U806': ['ZTE', 'T-U806'],
            'ZTE-T U812': ['ZTE', 'T-U812'],
            'ZTE-T U830': ['ZTE', 'T-U830'],
            'ZTE-T U880': ['ZTE', 'T-U880'],
            'ZTE T U880': ['ZTE', 'T-U880'],
            'ZTE-TU880': ['ZTE', 'T-U880'],
            'ZTE-TU900': ['ZTE', 'T-U900'],
            'ZTE-T U960': ['ZTE', 'T-U960'],
            'ZTE-TU960s': ['ZTE', 'T-U960'],
            'ZTE-T U960s': ['ZTE', 'T-U960'],
            'ZTE U N720': ['ZTE', 'U-N720'],
            'ZTE-U V856': ['ZTE', 'U-V856'],
            'ZTE-U V857': ['ZTE', 'U-V857'],
            'ZTE-U V881': ['ZTE', 'U-V881'],
            'ZTE-U X850': ['ZTE', 'U-X850'],
            'ZTE-U X876': ['ZTE', 'U-X876'],
            'ZTE-X876': ['ZTE', 'U-X876'],
            'ZTE-C R750': ['ZTE', 'C-R750'],
            'ZTE-C N600': ['ZTE', 'C-N600'],
            'ZTE-C N600+': ['ZTE', 'C-N600'],
            'ZTE-C N606': ['ZTE', 'C-N606'],
            'ZTE-C N700': ['ZTE', 'C-N700'],
            'ZTE-C N760': ['ZTE', 'C-N760'],
            'ZTE-C N880': ['ZTE', 'C-N880'],
            'ZTE-C N880S': ['ZTE', 'C-N880'],
            'ZTE-C N880s': ['ZTE', 'C-N880'],
            'ZTE-C X500': ['ZTE', 'C-X500'],
            'ZTE-C X920': ['ZTE', 'C-X920'],
            'ZXY-ZTE-C X920': ['ZTE', 'C-X920'],
            'ZTE GV821': ['ZTE', 'G-V821'],
            'ZTE N880E': ['ZTE', 'N880E'],
            'ZTE-N880E': ['ZTE', 'N880E'],
            'MIUI N880S': ['ZTE', 'N880S'],
            'ZTE N882E': ['ZTE', 'N882E'],
            'ZTE N855D': ['ZTE', 'N855D'],
            'ZTE-N910': ['ZTE', 'N910'],
            'E810': ['ZTE', 'E810'],
            'u880': ['ZTE', 'U880'],
            'ZTE U880E': ['ZTE', 'U880E'],
            'U880': ['ZTE', 'U880'],
            'ZTE U970': ['ZTE', 'U970'],
            'ZTE V768': ['ZTE', 'V768'],
            'ZTE-V856': ['ZTE', 'V856'],
            'ZTE V877b': ['ZTE', 'V877'],
            'ZTE V889D': ['ZTE', 'V889'],
            'ZTE-Z990': ['ZTE', 'Z990'],
            'ZTEU790': ['ZTE', 'U790'],
            '003Z': ['ZTE', 'Softbank 003Z'],
            '008Z': ['ZTE', 'Softbank 008Z'],
            '009Z': ['ZTE', 'Softbank Star7'],
            'i-mobile i691': ['i-Mobile', 'i691'],
            'i-mobile i695': ['i-Mobile', 'i695'],
            'i-mobile i858': ['i-Mobile', 'i858'],
            'i-mobile 3G 8500': ['i-Mobile', '3G 8500'],
            'i-mobile I-Note': ['i-Mobile', 'i-Note', 'tablet'],
            'Optimus Boston': ['Optimus', 'Boston'],
            'Optimus San Francisco': ['Optimus', 'San Francisco'],
            'Optimus Monte Carlo': ['Optimus', 'Monte Carlo'],
            'Orange Boston': ['Orange', 'Boston'],
            'Orange Monte Carlo': ['Orange', 'Monte Carlo'],
            'San Francisco': ['Orange', 'San Francisco'],
            'San Francisco for Orange': ['Orange', 'San Francisco'],
            'Orange San Francisco': ['Orange', 'San Francisco'],
            'MOVE': ['T-Mobile', 'MOVE'],
            'T-Mobile G1': ['T-Mobile', 'G1'],
            'T-Mobile G2': ['T-Mobile', 'G2'],
            'T-Mobile G2 Touch': ['T-Mobile', 'G2'],
            'LG-P999': ['T-Mobile', 'G2x'],
            'LG-E739': ['T-Mobile', 'myTouch'],
            'T-Mobile myTouch 3G': ['T-Mobile', 'myTouch 3G'],
            'T-Mobile myTouch 3G Slide': ['T-Mobile', 'myTouch 3G Slide'],
            'T-Mobile Espresso': ['T-Mobile', 'myTouch 3G Slide'],
            'HTC myTouch 3G Slide': ['T-Mobile', 'myTouch 3G Slide'],
            'T-Mobile myTouch 4G': ['T-Mobile', 'myTouch 4G'],
            'HTC Glacier': ['T-Mobile', 'myTouch 4G'],
            'HTC Panache': ['T-Mobile', 'myTouch 4G'],
            'myTouch4G': ['T-Mobile', 'myTouch 4G'],
            'My Touch 4G': ['T-Mobile', 'myTouch 4G'],
            'HTC Mytouch 4G': ['T-Mobile', 'myTouch 4G'],
            'HTC My Touch 4G': ['T-Mobile', 'myTouch 4G'],
            'HTC mytouch4g': ['T-Mobile', 'myTouch 4G'],
            'HTC myTouch 4G Slide': ['T-Mobile', 'myTouch 4G Slide'],
            'myTouch 4G Slide': ['T-Mobile', 'myTouch 4G Slide'],
            'T-Mobile myTouch Q': ['T-Mobile', 'myTouch Q'],
            'LG-C800': ['T-Mobile', 'myTouch Q'],
            'Pulse Mini': ['T-Mobile', 'Pulse Mini'],
            'Vodafone 845': ['Vodafone', '845 Nova'],
            'Vodafone 858': ['Vodafone', '858 Smart'],
            'Vodafone 945': ['Vodafone', '945'],
            'Vodafone Smart II': ['Vodafone', 'Smart II'],
            'SmartTab10': ['Vodafone', 'SmartTab 10', 'tablet'],
            'Coolpad 8190': ['Coolpad', '8190'],
            'U705T': ['Oppo', 'Ulike2'],
            'Coolpad 8020+': ['Coolpad', '8020'],
            'Huawei Y310-5000': ['Huawei', 'Y310'],
            'GT-S7572': ['Samsung', 'Galaxy Trend Duos II'],
            'Lenovo A278t': ['Lenovo', 'A278t'],
            'Lenovo A690': ['Lenovo', 'A690'],
            'GT-I8262D': ['Samsung', 'LePhone I8262D'],
            'Coolpad 8070': ['Coolpad', '8070'],
            'R813T': ['Oppo', 'R813T'],
            'ZTE U930': ['ZTE', 'U930'],
            'Lenovo A360': ['Lenovo', 'LePhone A360'],
            'SCH-N719': ['Samsung', 'Galaxy Note II'],
            'Coolpad 8010': ['Coolpad', '8010'],
            'LENOVO-Lenovo-A288t': ['Lenovo', 'A288t'],
            'U701T': ['Oppo', 'U701T'],
            'ZTEU795': ['Coolpad', 'U795'],
            'Haier-HT-I617': ['Haier', 'I617'],
            'ZTEU880s': ['ZTE', 'T-U880'],
            'GT-S6352': ['Samsung', 'GT-S6352'],
            'GT-S7568': ['Samsung', 'GT-S7568'],
            'K-Touch T619+': ['K-Touch', 'T619'],
            'MI 2A': ['Xiaomi', 'MI-TWO A'],
            'GT-N7108': ['Samsung', 'Galaxy Note II'],
            'K-Touch T621': ['K-Touch', 'T621'],
            'LENOVO-Lenovo-A298t': ['Lenovo', 'A298'],
            'Coolpad 8150': ['Coolpad', '8150'],
            '5860S': ['Coolpad', '5860'],
            'ZTEU807': ['ZTE', 'U807'],
            'SCH-I739': ['Samsung', 'SCH-I739'],
            'SCH-I829': ['Samsung', 'SCH-I829'],
            'HS-E830': ['Hisense', 'E830'],
            'HS-E920': ['Hisense', 'E920'],
            'Lenovo S720': ['Lenovo', 'S720'],
            'MI 2C': ['Xiaomi', 'MI-TWO'],
            'OPPO R813T': ['Oppo', 'R813'],
            'SCH-I879': ['Samsung', 'Galaxy Note'],
            'GT-S6102E': ['Samsung', 'Galaxy Y Duos']
        }

        var BLACKBERRY_MODELS = {
            '9600': 'Bold',
            '9650': 'Bold',
            '9700': 'Bold',
            '9780': 'Bold',
            '9790': 'Bold',
            '9900': 'Bold',
            '9930': 'Bold',
            '8300': 'Curve',
            '8310': 'Curve',
            '8320': 'Curve',
            '8330': 'Curve',
            '8350i': 'Curve',
            '8520': 'Curve',
            '8530': 'Curve',
            '8900': 'Curve',
            '9220': 'Curve',
            '9300': 'Curve',
            '9330': 'Curve',
            '9350': 'Curve',
            '9360': 'Curve',
            '9370': 'Curve',
            '9380': 'Curve',
            '8100': 'Pearl',
            '8110': 'Pearl',
            '8120': 'Pearl',
            '8130': 'Pearl',
            '8220': 'Pearl',
            '8230': 'Pearl',
            '9100': 'Pearl',
            '9105': 'Pearl',
            '9530': 'Storm',
            '9550': 'Storm',
            '9670': 'Style',
            '9800': 'Torch',
            '9810': 'Torch',
            '9850': 'Torch',
            '9860': 'Torch',
            '9630': 'Tour',
            '9981': 'Porsche P'
        };


        var Version = function () {
            this.initialize.apply(this, Array.prototype.slice.call(arguments))
        };
        Version.prototype = {
            initialize: function (v) {
                this.original = v.value || null;
                this.alias = v.alias || null;

            }
        }

        var Detected = function () {
            this.initialize.apply(this, arguments)
        };
        Detected.prototype = {
            initialize: function (ua, options) {
                this.options = {
                    useFeatures: options && options.useFeatures || false,
                    detectCamouflage: options && options.detectCamouflage || true
                }

                this.browser = {
                    'stock': true,
                    'hidden': false,
                    'channel': ''
                };
                this.engine = {};
                this.os = {};
                this.device = {
                    'type': 'desktop',
                    'identified': false
                };

                this.camouflage = false;
                this.features = [];
                this.detect(ua);
            },

            detect: function (ua) {

                /****************************************************
                 *      Unix
                 */

                if (ua.match('Unix')) {
                    this.os.name = 'Unix';
                }

                /****************************************************
                 *      FreeBSD
                 */

                if (ua.match('FreeBSD')) {
                    this.os.name = 'FreeBSD';
                }

                /****************************************************
                 *      OpenBSD
                 */

                if (ua.match('OpenBSD')) {
                    this.os.name = 'OpenBSD';
                }

                /****************************************************
                 *      NetBSD
                 */

                if (ua.match('NetBSD')) {
                    this.os.name = 'NetBSD';
                }

                /****************************************************
                 *      SunOS
                 */

                if (ua.match('SunOS')) {
                    this.os.name = 'Solaris';
                }

                /****************************************************
                 *      Linux
                 */

                if (ua.match('Linux')) {
                    this.os.name = 'Linux';

                    if (ua.match('CentOS')) {
                        this.os.name = 'CentOS';
                        if (match = /CentOS\/[0-9\.\-]+el([0-9_]+)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1].replace(/_/g, '.')
                            });
                        }
                    }

                    if (ua.match('Debian')) {
                        this.os.name = 'Debian';
                    }

                    if (ua.match('Fedora')) {
                        this.os.name = 'Fedora';
                        if (match = /Fedora\/[0-9\.\-]+fc([0-9]+)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1]
                            });
                        }
                    }

                    if (ua.match('Gentoo')) {
                        this.os.name = 'Gentoo';
                    }

                    if (ua.match('Kubuntu')) {
                        this.os.name = 'Kubuntu';
                    }

                    if (ua.match('Mandriva Linux')) {
                        this.os.name = 'Mandriva';
                        if (match = /Mandriva Linux\/[0-9\.\-]+mdv([0-9]+)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1]
                            });
                        }
                    }

                    if (ua.match('Mageia')) {
                        this.os.name = 'Mageia';
                        if (match = /Mageia\/[0-9\.\-]+mga([0-9]+)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1]
                            });
                        }
                    }

                    if (ua.match('Red Hat')) {
                        this.os.name = 'Red Hat';
                        if (match = /Red Hat[^\/]*\/[0-9\.\-]+el([0-9_]+)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1].replace(/_/g, '.')
                            });
                        }
                    }

                    if (ua.match('Slackware')) {
                        this.os.name = 'Slackware';
                    }

                    if (ua.match('SUSE')) {
                        this.os.name = 'SUSE';
                    }

                    if (ua.match('Turbolinux')) {
                        this.os.name = 'Turbolinux';
                    }

                    if (ua.match('Ubuntu')) {
                        this.os.name = 'Ubuntu';
                        if (match = /Ubuntu\/([0-9.]*)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1]
                            });
                        }
                    }
                }

                /****************************************************
                 *      iOS
                 */

                if (ua.match('iPhone( Simulator)?;') || ua.match('iPad;') || ua.match('iPod;') || ua.match(/iPhone\s*\d*s?[cp]?;/i)) {
                    this.os.name = 'iOS';
                    this.os.version = new Version({
                        value: '1.0'
                    });

                    if (match = /OS (.*) like Mac OS X/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1].replace(/_/g, '.')
                        });
                    }

                    if (ua.match('iPhone Simulator;')) {
                        this.device.type = 'emulator';
                    } else if (ua.match('iPod;')) {
                        this.device.type = 'media';
                        this.device.manufacturer = 'Apple';
                        this.device.model = 'iPod Touch';
                    } else if (ua.match('iPhone;') || ua.match(/iPhone\s*\d*s?[cp]?;/i)) {
                        this.device.type = 'mobile';
                        this.device.manufacturer = 'Apple';
                        this.device.model = 'iPhone';
                    } else {
                        this.device.type = 'tablet';
                        this.device.manufacturer = 'Apple';
                        this.device.model = 'iPad';
                    }

                    this.device.identified = true;
                }

                /****************************************************
                 *      MacOS X
                 */

                else if (ua.match('Mac OS X')) {
                    this.os.name = 'Mac OS X';

                    if (match = /Mac OS X (10[0-9\._]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1].replace(/_/g, '.')
                        });
                    }
                }

                /****************************************************
                 *      Windows
                 */

                if (ua.match('Windows')) {
                    this.os.name = 'Windows';

                    if (match = /Windows NT ([0-9]\.[0-9])/.exec(ua)) {
                        this.os.version = parseVersion(match[1]);

                        switch (match[1]) {
                            case '6.2':
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: '8'
                                });
                                break;
                            case '6.1':
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: '7'
                                });
                                break;
                            case '6.0':
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: 'Vista'
                                });
                                break;
                            case '5.2':
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: 'Server 2003'
                                });
                                break;
                            case '5.1':
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: 'XP'
                                });
                                break;
                            case '5.0':
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: '2000'
                                });
                                break;
                            default:
                                this.os.version = new Version({
                                    value: match[1],
                                    alias: 'NT ' + this.os.version
                                });
                        }
                    }

                    if (ua.match('Windows 95') || ua.match('Win95') || ua.match('Win 9x 4.00')) {
                        this.os.version = new Version({
                            value: '4.0',
                            alias: '95'
                        });
                    }

                    if (ua.match('Windows 98') || ua.match('Win98') || ua.match('Win 9x 4.10')) {
                        this.os.version = new Version({
                            value: '4.1',
                            alias: '98'
                        });
                    }

                    if (ua.match('Windows ME') || ua.match('WinME') || ua.match('Win 9x 4.90')) {
                        this.os.version = new Version({
                            value: '4.9',
                            alias: 'ME'
                        });
                    }

                    if (ua.match('Windows XP') || ua.match('WinXP')) {
                        this.os.name = new Version({
                            value: '5.1',
                            alias: 'XP'
                        });
                    }

                    if (ua.match('WP7')) {
                        this.os.name = 'Windows Phone';
                        this.os.version = new Version({
                            value: '7.0',
                            details: 2
                        });
                        this.device.type = 'mobile';
                        this.browser.mode = 'desktop';
                    }

                    if (ua.match('Windows CE') || ua.match('WinCE') || ua.match('WindowsCE')) {
                        if (ua.match(' IEMobile')) {
                            this.os.name = 'Windows Mobile';

                            if (ua.match(' IEMobile 8')) {
                                this.os.version = new Version({
                                    value: '6.5',
                                    details: 2
                                });
                            }

                            if (ua.match(' IEMobile 7')) {
                                this.os.version = new Version({
                                    value: '6.1',
                                    details: 2
                                });
                            }

                            if (ua.match(' IEMobile 6')) {
                                this.os.version = new Version({
                                    value: '6.0',
                                    details: 2
                                });
                            }
                        } else {
                            this.os.name = 'Windows CE';

                            if (match = /WindowsCEOS\/([0-9.]*)/.exec(ua)) {
                                this.os.version = new Version({
                                    value: match[1],
                                    details: 2
                                });
                            }

                            if (match = /Windows CE ([0-9.]*)/.exec(ua)) {
                                this.os.version = new Version({
                                    value: match[1],
                                    details: 2
                                });
                            }
                        }

                        this.device.type = 'mobile';
                    }

                    if (ua.match('Windows Mobile')) {
                        this.os.name = 'Windows Mobile';
                        this.device.type = 'mobile';
                    }

                    if (match = /WindowsMobile\/([0-9.]*)/.exec(ua)) {
                        this.os.name = 'Windows Mobile';
                        this.os.version = new Version({
                            value: match[1],
                            details: 2
                        });
                        this.device.type = 'mobile';
                    }

                    if (ua.match('Windows Phone [0-9]')) {
                        this.os.name = 'Windows Mobile';
                        this.os.version = new Version({
                            value: ua.match(/Windows Phone ([0-9.]*)/)[1],
                            details: 2
                        });
                        this.device.type = 'mobile';
                    }

                    if (ua.match('Windows Phone OS')) {
                        this.os.name = 'Windows Phone';
                        this.os.version = new Version({
                            value: ua.match(/Windows Phone OS ([0-9.]*)/)[1],
                            details: 2
                        });

                        if (this.os.version < 7) {
                            this.os.name = 'Windows Mobile';
                        }

                        if (match = /IEMobile\/[^;]+; ([^;]+); ([^;]+)[;|\)]/.exec(ua)) {
                            this.device.manufacturer = match[1];
                            this.device.model = match[2];
                        }

                        this.device.type = 'mobile';

                        var manufacturer = this.device.manufacturer;
                        var model = cleanupModel(this.device.model);

                        if (typeof WINDOWS_PHONE_MODELS[manufacturer] !== 'undefined' && typeof WINDOWS_PHONE_MODELS[manufacturer][model] !== 'undefined') {
                            this.device.manufacturer = WINDOWS_PHONE_MODELS[manufacturer][model][0];
                            this.device.model = WINDOWS_PHONE_MODELS[manufacturer][model][1];
                            this.device.identified = true;
                        }

                        if (manufacturer === 'Microsoft' && model === 'XDeviceEmulator') {
                            this.device.manufacturer = null;
                            this.device.model = null;
                            this.device.type = 'emulator';
                            this.device.identified = true;
                        }
                    }
                }

                /****************************************************
                 *      Android
                 */
                if (ua.match('Android')) {
                    this.os.name = 'Android';
                    this.os.version = null;

                    if (match = /Android(?: )?(?:AllPhone_|CyanogenMod_)?(?:\/)?v?([0-9.]+)/.exec(ua.replace('-update', '.'))) {
                        this.os.version = new Version({
                            value: match[1],
                            details: 3
                        })
                    }

                    if (ua.match('Android Eclair')) {
                        this.os.version = new Version({
                            value: '2.0',
                            details: 3
                        });
                    }

                    this.device.type = 'mobile';
                    if (this.os.version >= 3) this.device.type = 'tablet';
                    if (this.os.version >= 4 && ua.match('Mobile')) this.device.type = 'mobile';

                    if (match = /Eclair; (?:[a-zA-Z][a-zA-Z](?:[-_][a-zA-Z][a-zA-Z])?) Build\/([^\/]*)\//.exec(ua)) {
                        this.device.model = match[1];
                    } else if (match = /; ([^;]*[^;\s])\s+Build/.exec(ua)) {
                        this.device.model = match[1];
                    } else if (match = /[a-zA-Z][a-zA-Z](?:[-_][a-zA-Z][a-zA-Z])?; ([^;]*[^;\s]);\s+Build/.exec(ua)) {
                        this.device.model = match[1];
                    } else if (match = /\(([^;]+);U;Android\/[^;]+;[0-9]+\*[0-9]+;CTC\/2.0\)/.exec(ua)) {
                        this.device.model = match[1];
                    } else if (match = /;\s?([^;]+);\s?[0-9]+\*[0-9]+;\s?CTC\/2.0/.exec(ua)) {
                        this.device.model = match[1];
                    } else if (match = /zh-cn;\s*(.*?)(\/|build)/i.exec(ua)) {
                        this.device.model = match[1];
                    } else if (match = /Android [^;]+; (?:[a-zA-Z][a-zA-Z](?:[-_][a-zA-Z][a-zA-Z])?; )?([^)]+)\)/.exec(ua)) {
                        if (!ua.match(/[a-zA-Z][a-zA-Z](?:[-_][a-zA-Z][a-zA-Z])?/)) {
                            this.device.model = match[1];
                        }
                    } else if (match = /^(.+?)\/\S+/i.exec(ua)) {
                        this.device.model = match[1];
                    }


                    /* Sometimes we get a model name that starts with Android, in that case it is a mismatch and we should ignore it */
                    if (this.device.model && this.device.model.substring(0, 7) === 'Android') {
                        this.device.model = null;
                    }

                    if (this.device.model) {
                        var model = cleanupModel(this.device.model);

                        if (typeof ANDROID_MODELS[model] !== 'undefined') {
                            this.device.manufacturer = ANDROID_MODELS[model][0];
                            this.device.model = ANDROID_MODELS[model][1];
                            if (typeof ANDROID_MODELS[model][2] !== 'undefined') this.device.type = ANDROID_MODELS[model][2];
                            this.device.identified = true;
                        }

                        if (model === 'Emulator' || model === 'x86 Emulator' || model === 'x86 VirtualBox' || model === 'vm') {
                            this.device.manufacturer = null;
                            this.device.model = null;
                            this.device.type = 'emulator';
                            this.device.identified = true;
                        }
                    }

                    if (ua.match('HP eStation')) {
                        this.device.manufacturer = 'HP';
                        this.device.model = 'eStation';
                        this.device.type = 'tablet';
                        this.device.identified = true;
                    }
                    if (ua.match('Pre\/1.0')) {
                        this.device.manufacturer = 'Palm';
                        this.device.model = 'Pre';
                        this.device.identified = true;
                    }
                    if (ua.match('Pre\/1.1')) {
                        this.device.manufacturer = 'Palm';
                        this.device.model = 'Pre Plus';
                        this.device.identified = true;
                    }
                    if (ua.match('Pre\/1.2')) {
                        this.device.manufacturer = 'Palm';
                        this.device.model = 'Pre 2';
                        this.device.identified = true;
                    }
                    if (ua.match('Pre\/3.0')) {
                        this.device.manufacturer = 'HP';
                        this.device.model = 'Pre 3';
                        this.device.identified = true;
                    }
                    if (ua.match('Pixi\/1.0')) {
                        this.device.manufacturer = 'Palm';
                        this.device.model = 'Pixi';
                        this.device.identified = true;
                    }
                    if (ua.match('Pixi\/1.1')) {
                        this.device.manufacturer = 'Palm';
                        this.device.model = 'Pixi Plus';
                        this.device.identified = true;
                    }
                    if (ua.match('P160UN?A?\/1.0')) {
                        this.device.manufacturer = 'HP';
                        this.device.model = 'Veer';
                        this.device.identified = true;
                    }
                }

                /****************************************************
                 *      Google TV
                 */

                if (ua.match('GoogleTV')) {
                    this.os.name = 'Google TV';

                    if (ua.match('Chrome/5.')) {
                        this.os.version = new Version({
                            value: '1'
                        });
                    }

                    if (ua.match('Chrome/11.')) {
                        this.os.version = new Version({
                            value: '2'
                        });
                    }

                    this.device.type = 'television';
                }

                /****************************************************
                 *      WoPhone
                 */

                if (ua.match('WoPhone')) {
                    this.os.name = 'WoPhone';

                    if (match = /WoPhone\/([0-9\.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      BlackBerry
                 */

                if (ua.match('BlackBerry')) {
                    this.os.name = 'BlackBerry OS';

                    if (!ua.match('Opera')) {
                        if (match = /BlackBerry([0-9]*)\/([0-9.]*)/.exec(ua)) {
                            this.device.model = match[1];
                            this.os.version = new Version({
                                value: match[2],
                                details: 2
                            });
                        }

                        if (match = /; BlackBerry ([0-9]*);/.exec(ua)) {
                            this.device.model = match[1];
                        }

                        if (match = /Version\/([0-9.]*)/.exec(ua)) {
                            this.os.version = new Version({
                                value: match[1],
                                details: 2
                            });
                        }

                        if (this.os.version >= 10) {
                            this.os.name = 'BlackBerry';
                        }

                        if (typeof this.device.model !== 'undefined') {
                            if (typeof BLACKBERRY_MODELS[this.device.model] !== 'undefined') {
                                this.device.model = 'BlackBerry ' + BLACKBERRY_MODELS[this.device.model] + ' ' + this.device.model;
                            } else {
                                this.device.model = 'BlackBerry ' + this.device.model;
                            }
                        } else {
                            this.device.model = 'BlackBerry';
                        }
                    } else {
                        this.device.model = 'BlackBerry';
                    }

                    this.device.manufacturer = 'RIM';
                    this.device.type = 'mobile';
                    this.device.identified = true;
                }

                /****************************************************
                 *      BlackBerry PlayBook
                 */

                if (ua.match('RIM Tablet OS')) {
                    this.os.name = 'BlackBerry Tablet OS';
                    this.os.version = new Version({
                        value: ua.match(/RIM Tablet OS ([0-9.]*)/)[1],
                        details: 2
                    });

                    this.device.manufacturer = 'RIM';
                    this.device.model = 'BlackBerry PlayBook';
                    this.device.type = 'tablet';
                    this.device.identified = true;
                } else if (ua.match('PlayBook')) {
                    if (match = /Version\/(10[0-9.]*)/.exec(ua)) {
                        this.os.name = 'BlackBerry';
                        this.os.version = new Version({
                            value: match[1],
                            details: 2
                        });

                        this.device.manufacturer = 'RIM';
                        this.device.model = 'BlackBerry PlayBook';
                        this.device.type = 'tablet';
                        this.device.identified = true;
                    }
                }


                /****************************************************
                 *      WebOS
                 */

                if (ua.match('(?:web|hpw)OS')) {
                    this.os.name = 'webOS';
                    this.os.version = new Version({
                        value: ua.match(/(?:web|hpw)OS\/([0-9.]*)/)[1]
                    });

                    if (ua.match('tablet')) this.device.type = 'tablet';
                    else this.device.type = 'mobile';

                    this.device.manufacturer = ua.match('hpwOS') ? 'HP' : 'Palm';
                    if (ua.match('Pre\/1.0')) this.device.model = 'Pre';
                    if (ua.match('Pre\/1.1')) this.device.model = 'Pre Plus';
                    if (ua.match('Pre\/1.2')) this.device.model = 'Pre2';
                    if (ua.match('Pre\/3.0')) this.device.model = 'Pre3';
                    if (ua.match('Pixi\/1.0')) this.device.model = 'Pixi';
                    if (ua.match('Pixi\/1.1')) this.device.model = 'Pixi Plus';
                    if (ua.match('P160UN?A?\/1.0')) this.device.model = 'Veer';
                    if (ua.match('TouchPad\/1.0')) this.device.model = 'TouchPad';

                    if (ua.match('Emulator\/') || ua.match('Desktop\/')) {
                        this.device.type = 'emulator';
                        this.device.manufacturer = null;
                        this.device.model = null;
                    }

                    this.device.identified = true;
                }

                /****************************************************
                 *      S60
                 */

                if (ua.match('Symbian') || ua.match('Series[ ]?60') || ua.match('S60')) {
                    this.os.name = 'Series60';

                    if (ua.match('SymbianOS/9.1') && !ua.match('Series60')) {
                        this.os.version = new Version({
                            value: '3.0'
                        });
                    }

                    if (match = /Series60\/([0-9.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    if (match = /Nokia([^\/;]+)[\/|;]/.exec(ua)) {
                        if (match[1] !== 'Browser') {
                            this.device.manufacturer = 'Nokia';
                            this.device.model = match[1];
                            this.device.identified = true;
                        }
                    }

                    if (match = /Vertu([^\/;]+)[\/|;]/.exec(ua)) {
                        this.device.manufacturer = 'Vertu';
                        this.device.model = match[1];
                        this.device.identified = true;
                    }

                    if (match = /Symbian; U; ([^;]+); [a-z][a-z]\-[a-z][a-z]/i.exec(ua)) {
                        this.device.manufacturer = 'Nokia';
                        this.device.model = match[1];
                        this.device.identified = true;
                    }

                    if (match = /Samsung\/([^;]*);/.exec(ua)) {
                        this.device.manufacturer = STRINGS_SAMSUNG;
                        this.device.model = match[1];
                        this.device.identified = true;
                    }

                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      S40
                 */

                if (ua.match('Series40')) {
                    this.os.name = 'Series40';

                    if (match = /Nokia([^\/]+)\//.exec(ua)) {
                        this.device.manufacturer = 'Nokia';
                        this.device.model = match[1];
                        this.device.identified = true;
                    }

                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      MeeGo
                 */

                if (ua.match('MeeGo')) {
                    this.os.name = 'MeeGo';
                    this.device.type = 'mobile';

                    if (match = /Nokia([^\)]+)\)/.exec(ua)) {
                        this.device.manufacturer = 'Nokia';
                        this.device.model = match[1];
                        this.device.identified = true;
                    }
                }

                /****************************************************
                 *      Maemo
                 */

                if (ua.match('Maemo')) {
                    this.os.name = 'Maemo';
                    this.device.type = 'mobile';

                    if (match = /(N[0-9]+)/.exec(ua)) {
                        this.device.manufacturer = 'Nokia';
                        this.device.model = match[1];
                        this.device.identified = true;
                    }
                }

                /****************************************************
                 *      Tizen
                 */

                if (ua.match('Tizen')) {
                    this.os.name = 'Tizen';

                    if (match = /Tizen[\/ ]([0-9.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    this.device.type = 'mobile';

                    if (match = /\(([^;]+); ([^\/]+)\//.exec(ua)) {
                        if (match[1] !== 'Linux') {
                            this.device.manufacturer = match[1];
                            this.device.model = match[2];

                            if (typeof TIZEN_MODELS[this.device.manufacturer] !== 'undefined' && typeof TIZEN_MODELS[this.device.manufacturer][this.device.model] !== 'undefined') {
                                var manufacturer = this.device.manufacturer;
                                var model = cleanupModel(this.device.model);

                                this.device.manufacturer = TIZEN_MODELS[manufacturer][model][0];
                                this.device.model = TIZEN_MODELS[manufacturer][model][1];
                                this.device.identified = true;
                            }
                        }
                    }
                }

                /****************************************************
                 *      Bada
                 */

                if (ua.match('[b|B]ada')) {
                    this.os.name = 'Bada';

                    if (match = /[b|B]ada\/([0-9.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    this.device.type = 'mobile';

                    if (match = /\(([^;]+); ([^\/]+)\//.exec(ua)) {
                        this.device.manufacturer = match[1];
                        this.device.model = cleanupModel(match[2]);
                    }

                    if (typeof BADA_MODELS[this.device.manufacturer] !== 'undefined' && typeof BADA_MODELS[this.device.manufacturer][this.device.model] !== 'undefined') {
                        var manufacturer = this.device.manufacturer;
                        var model = cleanupModel(this.device.model);

                        this.device.manufacturer = BADA_MODELS[manufacturer][model][0];
                        this.device.model = BADA_MODELS[manufacturer][model][1];
                        this.device.identified = true;
                    }
                }

                /****************************************************
                 *      Brew
                 */

                if (ua.match(/BREW/i) || ua.match('BMP; U')) {
                    this.os.name = 'Brew';
                    this.device.type = 'mobile';

                    if (match = /BREW; U; ([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    } else if (match = /;BREW\/([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }


                    if (match = /\(([^;]+);U;REX\/[^;]+;BREW\/[^;]+;(?:.*;)?[0-9]+\*[0-9]+;CTC\/2.0\)/.exec(ua)) {
                        this.device.model = match[1];
                    }

                    if (this.device.model) {
                        var model = cleanupModel(this.device.model);

                        if (typeof BREW_MODELS[model] !== 'undefined') {
                            this.device.manufacturer = BREW_MODELS[model][0];
                            this.device.model = BREW_MODELS[model][1];
                            this.device.identified = true;
                        }
                    }
                }

                /****************************************************
                 *      MTK
                 */

                if (ua.match(/\(MTK;/)) {
                    this.os.name = 'MTK';
                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      CrOS
                 */

                if (ua.match('CrOS')) {
                    this.os.name = 'Chrome OS';
                    this.device.type = 'desktop';
                }

                /****************************************************
                 *      Joli OS
                 */

                if (ua.match('Joli OS')) {
                    this.os.name = 'Joli OS';
                    this.device.type = 'desktop';

                    if (match = /Joli OS\/([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Haiku
                 */

                if (ua.match('Haiku')) {
                    this.os.name = 'Haiku';
                    this.device.type = 'desktop';
                }

                /****************************************************
                 *      QNX
                 */

                if (ua.match('QNX')) {
                    this.os.name = 'QNX';
                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      OS/2 Warp
                 */

                if (ua.match('OS\/2; Warp')) {
                    this.os.name = 'OS/2 Warp';
                    this.device.type = 'desktop';

                    if (match = /OS\/2; Warp ([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Grid OS
                 */

                if (ua.match('Grid OS')) {
                    this.os.name = 'Grid OS';
                    this.device.type = 'tablet';

                    if (match = /Grid OS ([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      AmigaOS
                 */

                if (ua.match(/AmigaOS/i)) {
                    this.os.name = 'AmigaOS';
                    this.device.type = 'desktop';

                    if (match = /AmigaOS ([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                }

                /****************************************************
                 *      MorphOS
                 */

                if (ua.match(/MorphOS/i)) {
                    this.os.name = 'MorphOS';
                    this.device.type = 'desktop';

                    if (match = /MorphOS ([0-9.]*)/i.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                }

                /****************************************************
                 *      Kindle
                 */

                if (ua.match('Kindle') && !ua.match('Fire')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Amazon';
                    this.device.model = 'Kindle';
                    this.device.type = 'ereader';

                    if (ua.match('Kindle\/2.0')) this.device.model = 'Kindle 2';
                    if (ua.match('Kindle\/3.0')) this.device.model = 'Kindle 3 or later';

                    this.device.identified = true;
                }

                /****************************************************
                 *      NOOK
                 */

                if (ua.match('nook browser')) {
                    this.os.name = 'Android';

                    this.device.manufacturer = 'Barnes & Noble';
                    this.device.model = 'NOOK';
                    this.device.type = 'ereader';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Bookeen
                 */

                if (ua.match('bookeen\/cybook')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Bookeen';
                    this.device.model = 'Cybook';
                    this.device.type = 'ereader';

                    if (ua.match('Orizon')) {
                        this.device.model = 'Cybook Orizon';
                    }

                    this.device.identified = true;
                }

                /****************************************************
                 *      Sony Reader
                 */

                if (ua.match('EBRD1101')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Sony';
                    this.device.model = 'Reader';
                    this.device.type = 'ereader';
                    this.device.identified = true;
                }

                /****************************************************
                 *      iRiver
                 */

                if (ua.match('Iriver ;')) {
                    this.os.name = '';

                    this.device.manufacturer = 'iRiver';
                    this.device.model = 'Story';
                    this.device.type = 'ereader';

                    if (ua.match('EB07')) {
                        this.device.model = 'Story HD EB07';
                    }

                    this.device.identified = true;
                }

                /****************************************************
                 *      Nintendo
                 *
                 *      Opera/9.30 (Nintendo Wii; U; ; 3642; en)
                 *      Opera/9.30 (Nintendo Wii; U; ; 2047-7; en)
                 *      Opera/9.50 (Nintendo DSi; Opera/507; U; en-US)
                 *      Mozilla/5.0 (Nintendo 3DS; U; ; en) Version/1.7455.US
                 *      Mozilla/5.0 (Nintendo 3DS; U; ; en) Version/1.7455.EU
                 */

                if (ua.match('Nintendo Wii')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Nintendo';
                    this.device.model = 'Wii';
                    this.device.type = 'gaming';
                    this.device.identified = true;
                }

                if (ua.match('Nintendo DSi')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Nintendo';
                    this.device.model = 'DSi';
                    this.device.type = 'gaming';
                    this.device.identified = true;
                }

                if (ua.match('Nintendo 3DS')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Nintendo';
                    this.device.model = '3DS';
                    this.device.type = 'gaming';

                    if (match = /Version\/([0-9.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    this.device.identified = true;
                }


                if (ua.match('PlayStation Portable')) {
                    this.os.name = '';

                    this.device.manufacturer = 'Sony';
                    this.device.model = 'Playstation Portable';
                    this.device.type = 'gaming';
                    this.device.identified = true;
                }

                if (ua.match('PlayStation Vita')) {
                    this.os.name = '';

                    if (match = /PlayStation Vita ([0-9.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    this.device.manufacturer = 'Sony';
                    this.device.model = 'PlayStation Vita';
                    this.device.type = 'gaming';
                    this.device.identified = true;
                }

                if (ua.match(/PlayStation 3/i)) {
                    this.os.name = '';

                    if (match = /PLAYSTATION 3;? ([0-9.]*)/.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    this.device.manufacturer = 'Sony';
                    this.device.model = 'Playstation 3';
                    this.device.type = 'gaming';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Panasonic Smart Viera
                 *
                 *      Mozilla/5.0 (FreeBSD; U; Viera; ja-JP) AppleWebKit/535.1 (KHTML, like Gecko) Viera/1.2.4 Chrome/14.0.835.202 Safari/535.1
                 */

                if (ua.match('Viera')) {
                    this.os.name = '';
                    this.device.manufacturer = 'Panasonic';
                    this.device.model = 'Smart Viera';
                    this.device.type = 'television';
                    this.device.identified = true;
                }


                /****************************************************
                 *      Sharp AQUOS TV
                 *
                 *      Mozilla/5.0 (DTV) AppleWebKit/531.2  (KHTML, like Gecko) AQUOSBrowser/1.0 (US00DTV;V;0001;0001)
                 *      Mozilla/5.0 (DTV) AppleWebKit/531.2+ (KHTML, like Gecko) Espial/6.0.4 AQUOSBrowser/1.0 (CH00DTV;V;0001;0001)
                 *      Opera/9.80 (Linux armv6l; U; en) Presto/2.8.115 Version/11.10 AQUOS-AS/1.0 LC-40LE835X
                 */

                if (ua.match('AQUOSBrowser') || ua.match('AQUOS-AS')) {
                    this.os.name = '';
                    this.device.manufacturer = STRINGS_SHARP;
                    this.device.model = 'Aquos TV';
                    this.device.type = 'television';
                    this.device.identified = true;
                }


                /****************************************************
                 *      Samsung Smart TV
                 *
                 *      Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV; Maple2012) AppleWebKit/534.7 (KHTML, like Gecko) SmartTV Safari/534.7
                 *      Mozilla/5.0 (SmartHub; SMART-TV; U; Linux/SmartTV) AppleWebKit/531.2+ (KHTML, like Gecko) WebBrowser/1.0 SmartTV Safari/531.2+
                 */

                if (ua.match('SMART-TV')) {
                    this.os.name = '';
                    this.device.manufacturer = STRINGS_SAMSUNG;
                    this.device.model = 'Smart TV';
                    this.device.type = 'television';
                    this.device.identified = true;

                    if (match = /Maple([0-9]*)/.exec(ua)) {
                        this.device.model += ' ' + match[1];
                    }
                }

                /****************************************************
                 *      Sony Internet TV
                 *
                 *      Opera/9.80 (Linux armv7l; U; InettvBrowser/2.2(00014A;SonyDTV115;0002;0100) KDL-46EX640; CC/USA; en) Presto/2.8.115 Version/11.10
                 *      Opera/9.80 (Linux armv7l; U; InettvBrowser/2.2(00014A;SonyDTV115;0002;0100) KDL-40EX640; CC/USA; en) Presto/2.10.250 Version/11.60
                 *      Opera/9.80 (Linux armv7l; U; InettvBrowser/2.2(00014A;SonyDTV115;0002;0100) N/A; CC/USA; en) Presto/2.8.115 Version/11.10
                 *      Opera/9.80 (Linux mips; U; InettvBrowser/2.2 (00014A;SonyDTV115;0002;0100) ; CC/JPN; en) Presto/2.9.167 Version/11.50
                 *      Opera/9.80 (Linux mips; U; InettvBrowser/2.2 (00014A;SonyDTV115;0002;0100) AZ2CVT2; CC/CAN; en) Presto/2.7.61 Version/11.00
                 *      Opera/9.80 (Linux armv6l; Opera TV Store/4207; U; (SonyBDP/BDV11); en) Presto/2.9.167 Version/11.50
                 *      Opera/9.80 (Linux armv6l ; U; (SonyBDP/BDV11); en) Presto/2.6.33 Version/10.60
                 *      Opera/9.80 (Linux armv6l; U; (SonyBDP/BDV11); en) Presto/2.8.115 Version/11.10
                 */

                if (ua.match('SonyDTV|SonyBDP|SonyCEBrowser')) {
                    this.os.name = '';
                    this.device.manufacturer = 'Sony';
                    this.device.model = 'Internet TV';
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Philips Net TV
                 *
                 *      Opera/9.70 (Linux armv6l ; U; CE-HTML/1.0 NETTV/2.0.2; en) Presto/2.2.1
                 *      Opera/9.80 (Linux armv6l ; U; CE-HTML/1.0 NETTV/3.0.1;; en) Presto/2.6.33 Version/10.60
                 *      Opera/9.80 (Linux mips; U; CE-HTML/1.0 NETTV/3.0.1; PHILIPS-AVM-2012; en) Presto/2.9.167 Version/11.50
                 *      Opera/9.80 (Linux mips ; U; HbbTV/1.1.1 (; Philips; ; ; ; ) CE-HTML/1.0 NETTV/3.1.0; en) Presto/2.6.33 Version/10.70
                 *      Opera/9.80 (Linux i686; U; HbbTV/1.1.1 (; Philips; ; ; ; ) CE-HTML/1.0 NETTV/3.1.0; en) Presto/2.9.167 Version/11.50
                 */

                if (ua.match('NETTV\/')) {
                    this.os.name = '';
                    this.device.manufacturer = 'Philips';
                    this.device.model = 'Net TV';
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      LG NetCast TV
                 *
                 *      Mozilla/5.0 (DirectFB; Linux armv7l) AppleWebKit/534.26+ (KHTML, like Gecko) Version/5.0 Safari/534.26+ LG Browser/5.00.00(+mouse+3D+SCREEN+TUNER; LGE; GLOBAL-PLAT4; 03.09.22; 0x00000001;); LG NetCast.TV-2012
                 *      Mozilla/5.0 (DirectFB; Linux armv7l) AppleWebKit/534.26+ (KHTML, like Gecko) Version/5.0 Safari/534.26+ LG Browser/5.00.00(+SCREEN+TUNER; LGE; GLOBAL-PLAT4; 01.00.00; 0x00000001;); LG NetCast.TV-2012
                 *      Mozilla/5.0 (DirectFB; U; Linux armv6l; en) AppleWebKit/531.2  (KHTML, like Gecko) Safari/531.2  LG Browser/4.1.4( BDP; LGE; Media/BD660; 6970; abc;); LG NetCast.Media-2011
                 *      Mozilla/5.0 (DirectFB; U; Linux 7631; en) AppleWebKit/531.2  (KHTML, like Gecko) Safari/531.2  LG Browser/4.1.4( NO_NUM; LGE; Media/SP520; ST.3.97.409.F; 0x00000001;); LG NetCast.Media-2011
                 *      Mozilla/5.0 (DirectFB; U; Linux 7630; en) AppleWebKit/531.2  (KHTML, like Gecko) Safari/531.2  LG Browser/4.1.4( 3D BDP NO_NUM; LGE; Media/ST600; LG NetCast.Media-2011
                 *      (LGSmartTV/1.0) AppleWebKit/534.23 OBIGO-T10/2.0
                 */

                if (match = /LG NetCast\.(?:TV|Media)-([0-9]*)/.exec(ua)) {
                    this.os.name = '';
                    this.device.manufacturer = STRINGS_LG;
                    this.device.model = 'NetCast TV ' + match[1];
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                if (match = /LGSmartTV/.exec(ua)) {
                    this.os.name = '';
                    this.device.manufacturer = STRINGS_LG;
                    this.device.model = 'Smart TV';
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Toshiba Smart TV
                 *
                 *      Mozilla/5.0 (Linux mipsel; U; HbbTV/1.1.1 (; TOSHIBA; DTV_RL953; 56.7.66.7; t12; ) ; ToshibaTP/1.3.0 (+VIDEO_MP4+VIDEO_X_MS_ASF+AUDIO_MPEG+AUDIO_MP4+DRM+NATIVELAUNCH) ; en) AppleWebKit/534.1 (KHTML, like Gecko)
                 *      Mozilla/5.0 (DTV; TSBNetTV/T32013713.0203.7DD; TVwithVideoPlayer; like Gecko) NetFront/4.1 DTVNetBrowser/2.2 (000039;T32013713;0203;7DD) InettvBrowser/2.2 (000039;T32013713;0203;7DD)
                 *      Mozilla/5.0 (Linux mipsel; U; HbbTV/1.1.1 (; TOSHIBA; 40PX200; 0.7.3.0.; t12; ) ; Toshiba_TP/1.3.0 (+VIDEO_MP4+AUDIO_MPEG+AUDIO_MP4+VIDEO_X_MS_ASF+OFFLINEAPP) ; en) AppleWebKit/534.1 (KHTML, like Gec
                 */

                if (ua.match('Toshiba_?TP\/') || ua.match('TSBNetTV\/')) {
                    this.os.name = '';
                    this.device.manufacturer = 'Toshiba';
                    this.device.model = 'Smart TV';
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      MachBlue XT
                 */

                if (match = /mbxtWebKit\/([0-9.]*)/.exec(ua)) {
                    this.os.name = '';
                    this.browser.name = 'MachBlue XT'
                    this.browser.version = new Version({
                        value: match[1],
                        details: 2
                    });
                    this.device.type = 'television';
                }

                /****************************************************
                 *      ADB
                 */

                if (match = /\(ADB; ([^\)]+)\)/.exec(ua)) {
                    this.os.name = '';
                    this.device.manufacturer = 'ADB';
                    this.device.model = (match[1] !== 'Unknown' ? match[1].replace('ADB', '') + ' ' : '') + 'IPTV receiver';
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      MStar
                 */

                if (ua.match(/Mstar;OWB/)) {
                    this.os.name = '';
                    this.device.manufacturer = 'MStar';
                    this.device.model = 'PVR';
                    this.device.type = 'television';
                    this.device.identified = true;

                    this.browser.name = 'Origyn Web Browser';
                }

                /****************************************************
                 *      TechniSat
                 */

                if (match = /\TechniSat ([^;]+);/.exec(ua)) {
                    this.os.name = '';
                    this.device.manufacturer = 'TechniSat';
                    this.device.model = match[1];
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Technicolor
                 */

                if (match = /\Technicolor_([^;]+);/.exec(ua)) {
                    this.os.name = '';
                    this.device.manufacturer = 'Technicolor';
                    this.device.model = match[1];
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Winbox Evo2
                 */

                if (match = /Winbox Evo2/.exec(ua)) {
                    this.os.name = '';
                    this.device.manufacturer = 'Winbox';
                    this.device.model = 'Evo2';
                    this.device.type = 'television';
                    this.device.identified = true;
                }

                /****************************************************
                 *      Roku
                 */

                if (match = /^Roku\/DVP-([0-9]+)/.exec(ua)) {
                    this.device.manufacturer = 'Roku';
                    this.device.type = 'television';

                    switch (match[1]) {
                        case '2000':
                            this.device.model = 'HD';
                            break;
                        case '2050':
                            this.device.model = 'XD';
                            break;
                        case '2100':
                            this.device.model = 'XDS';
                            break;
                        case '2400':
                            this.device.model = 'LT';
                            break;
                        case '3000':
                            this.device.model = '2 HD';
                            break;
                        case '3050':
                            this.device.model = '2 XD';
                            break;
                        case '3100':
                            this.device.model = '2 XS';
                            break;
                    }

                    this.device.identified = true;
                }

                if (match = /HbbTV\/1.1.1 \([^;]*;\s*([^;]*)\s*;\s*([^;]*)\s*;/.exec(ua)) {
                    var vendorName = match[1].trim();
                    var modelName = match[2].trim();

                    if (!this.device.manufacturer && vendorName !== '' && vendorName !== 'vendorName') {
                        switch (vendorName) {
                            case 'LGE':
                                this.device.manufacturer = 'LG';
                                break;
                            case 'TOSHIBA':
                                this.device.manufacturer = 'Toshiba';
                                break;
                            case 'smart':
                                this.device.manufacturer = 'Smart';
                                break;
                            case 'tv2n':
                                this.device.manufacturer = 'TV2N';
                                break;
                            default:
                                this.device.manufacturer = vendorName;
                        }

                        if (!this.device.model && modelName !== '' && modelName !== 'modelName') {
                            switch (modelName) {
                                case 'GLOBAL_PLAT3':
                                    this.device.model = 'NetCast TV';
                                    break;
                                case 'SmartTV2012':
                                    this.device.model = 'Smart TV 2012';
                                    break;
                                case 'videoweb':
                                    this.device.model = 'Videoweb';
                                    break;
                                default:
                                    this.device.model = modelName;
                            }

                            if (vendorName === 'Humax') {
                                this.device.model = this.device.model.toUpperCase();
                            }

                            this.device.identified = true;
                            this.os.name = '';
                        }
                    }

                    this.device.type = 'television';
                }

                /****************************************************
                 *      Detect type based on common identifiers
                 */

                if (ua.match('InettvBrowser')) {
                    this.device.type = 'television';
                }

                if (ua.match('MIDP')) {
                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      Try to detect any devices based on common
                 *      locations of model ids
                 */

                if (!this.device.model && !this.device.manufacturer) {
                    var candidates = [];

                    if (!ua.match(/^(Mozilla|Opera)/)) if (match = /^(?:MQQBrowser\/[0-9\.]+\/)?([^\s]+)/.exec(ua)) {
                        match[1] = match[1].replace(/_TD$/, '');
                        match[1] = match[1].replace(/_CMCC$/, '');
                        match[1] = match[1].replace(/[_ ]Mozilla$/, '');
                        match[1] = match[1].replace(/ Linux$/, '');
                        match[1] = match[1].replace(/ Opera$/, '');
                        match[1] = match[1].replace(/\/[0-9].*$/, '');

                        candidates.push(match[1]);
                    }

                    if (match = /[0-9]+x[0-9]+; ([^;]+)/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    if (match = /[0-9]+X[0-9]+ ([^;\/\(\)]+)/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    if (match = /Windows NT 5.1; ([^;]+); Windows Phone/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    if (match = /\) PPC; (?:[0-9]+x[0-9]+; )?([^;\/\(\)]+)/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    if (match = /\(([^;]+); U; Windows Mobile/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    if (match = /Vodafone\/1.0\/([^\/]+)/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    if (match = /\ ([^\s]+)$/.exec(ua)) {
                        candidates.push(match[1]);
                    }

                    for (var i = 0; i < candidates.length; i++) {

                        if (!this.device.model && !this.device.manufacturer) {
                            var model = cleanupModel(candidates[i]);
                            var result = false;

                            if (this.os.name === 'Android') {
                                if (typeof ANDROID_MODELS[model] !== 'undefined') {
                                    this.device.manufacturer = ANDROID_MODELS[model][0];
                                    this.device.model = ANDROID_MODELS[model][1];
                                    if (typeof ANDROID_MODELS[model][2] !== 'undefined') this.device.type = ANDROID_MODELS[model][2];
                                    this.device.identified = true;

                                    result = true;
                                }
                            }

                            if (!this.os.name || this.os.name === 'Windows' || this.os.name === 'Windows Mobile' || this.os.name === 'Windows CE') {
                                if (typeof WINDOWS_MOBILE_MODELS[model] !== 'undefined') {
                                    this.device.manufacturer = WINDOWS_MOBILE_MODELS[model][0];
                                    this.device.model = WINDOWS_MOBILE_MODELS[model][1];
                                    this.device.type = 'mobile';
                                    this.device.identified = true;

                                    if (this.os.name !== 'Windows Mobile') {
                                        this.os.name = 'Windows Mobile';
                                        this.os.version = null;
                                    }

                                    result = true;
                                }
                            }
                        }

                        if (!result) {
                            if (match = /^GIONEE-([^\s]+)/.exec(candidates[i])) {
                                this.device.manufacturer = 'Gionee';
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /^HTC_?([^\/_]+)(?:\/|_|$)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_HTC;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /^HUAWEI-([^\/]*)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_HUAWEI;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /(?:^|\()LGE?(?:\/|-|_|\s)([^\s]*)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_LG;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /^MOT-([^\/_]+)(?:\/|_|$)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_MOTOROLA;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /^Motorola_([^\/_]+)(?:\/|_|$)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_MOTOROLA;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /^Nokia([^\/]+)(?:\/|$)/.exec(candidates[i])) {
                                this.device.manufacturer = 'Nokia';
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;

                                if (!this.os.name) {
                                    this.os.name = 'Series40';
                                }
                            }

                            if (match = /^SonyEricsson([^\/_]+)(?:\/|_|$)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_SONY_ERICSSON;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';
                                this.device.identified = true;
                            }

                            if (match = /^SAMSUNG-([^\/_]+)(?:\/|_|$)/.exec(candidates[i])) {
                                this.device.manufacturer = STRINGS_SAMSUNG;
                                this.device.model = cleanupModel(match[1]);
                                this.device.type = 'mobile';

                                if (this.os.name === 'Bada') {
                                    var manufacturer = 'SAMSUNG';
                                    var model = cleanupModel(this.device.model);

                                    if (typeof BADA_MODELS[manufacturer] !== 'undefined' && typeof BADA_MODELS[manufacturer][model] !== 'undefined') {
                                        this.device.manufacturer = BADA_MODELS[manufacturer][model][0];
                                        this.device.model = BADA_MODELS[manufacturer][model][1];
                                        this.device.identified = true;
                                    }
                                } else if (match = /Jasmine\/([0-9.]*)/.exec(ua)) {
                                    var version = match[1];
                                    var manufacturer = 'SAMSUNG';
                                    var model = cleanupModel(this.device.model);

                                    if (typeof TOUCHWIZ_MODELS[manufacturer] !== 'undefined' && typeof TOUCHWIZ_MODELS[manufacturer][model] !== 'undefined') {
                                        this.device.manufacturer = TOUCHWIZ_MODELS[manufacturer][model][0];
                                        this.device.model = TOUCHWIZ_MODELS[manufacturer][model][1];
                                        this.device.identified = true;

                                        this.os.name = 'Touchwiz';
                                        this.os.version = new Version({
                                            value: '2.0'
                                        });
                                    }
                                } else if (match = /Dolfin\/([0-9.]*)/.exec(ua)) {
                                    var version = match[1];
                                    var manufacturer = 'SAMSUNG';
                                    var model = cleanupModel(this.device.model);

                                    if (typeof BADA_MODELS[manufacturer] !== 'undefined' && typeof BADA_MODELS[manufacturer][model] !== 'undefined') {
                                        this.device.manufacturer = BADA_MODELS[manufacturer][model][0];
                                        this.device.model = BADA_MODELS[manufacturer][model][1];
                                        this.device.identified = true;

                                        this.os.name = 'Bada';

                                        switch (version) {
                                            case '2.0':
                                                this.os.version = new Version({
                                                    value: '1.0'
                                                });
                                                break;
                                            case '2.2':
                                                this.os.version = new Version({
                                                    value: '1.2'
                                                });
                                                break;
                                            case '3.0':
                                                this.os.version = new Version({
                                                    value: '2.0'
                                                });
                                                break;
                                        }
                                    }

                                    if (typeof TOUCHWIZ_MODELS[manufacturer] !== 'undefined' && typeof TOUCHWIZ_MODELS[manufacturer][model] !== 'undefined') {
                                        this.device.manufacturer = TOUCHWIZ_MODELS[manufacturer][model][0];
                                        this.device.model = TOUCHWIZ_MODELS[manufacturer][model][1];
                                        this.device.identified = true;

                                        this.os.name = 'Touchwiz';

                                        switch (version) {
                                            case '1.0':
                                                this.os.version = new Version({
                                                    value: '1.0'
                                                });
                                                break;
                                            case '1.5':
                                                this.os.version = new Version({
                                                    value: '2.0'
                                                });
                                                break;
                                            case '2.0':
                                                this.os.version = new Version({
                                                    value: '3.0'
                                                });
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }


                if (match = /\((?:LG[-|\/])(.*) (?:Browser\/)?AppleWebkit/.exec(ua)) {
                    this.device.manufacturer = STRINGS_LG;
                    this.device.model = match[1];
                    this.device.type = 'mobile';
                    this.device.identified = true;
                }

                if (match = /^Mozilla\/5.0 \((?:Nokia|NOKIA)(?:\s?)([^\)]+)\)UC AppleWebkit\(like Gecko\) Safari\/530$/.exec(ua)) {
                    this.device.manufacturer = 'Nokia';
                    this.device.model = match[1];
                    this.device.type = 'mobile';
                    this.device.identified = true;

                    this.os.name = 'Series60';
                }


                /****************************************************
                 *      Safari
                 */

                if (ua.match('Safari')) {
                    if (this.os.name === 'iOS') {
                        this.browser.stock = true;
                        this.browser.hidden = true;
                        this.browser.name = 'Safari';
                        this.browser.version = null;
                    }


                    if (this.os.name === 'Mac OS X' || this.os.name === 'Windows') {
                        this.browser.name = 'Safari';
                        this.browser.stock = this.os.name === 'Mac OS X';

                        if (match = /Version\/([0-9\.]+)/.exec(ua)) {
                            this.browser.version = new Version({
                                value: match[1]
                            });
                        }

                        if (ua.match(/AppleWebKit\/[0-9\.]+\+/)) {
                            this.browser.name = 'WebKit Nightly Build';
                            this.browser.version = null;
                        }
                    }
                }

                /****************************************************
                 *      Internet Explorer
                 */

                if (ua.match('MSIE')) {
                    this.browser.name = 'Internet Explorer';

                    if (ua.match('IEMobile') || ua.match('Windows CE') || ua.match('Windows Phone') || ua.match('WP7')) {
                        this.browser.name = 'Mobile Internet Explorer';
                    }

                    if (match = /MSIE ([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Opera
                 */

                if (ua.match(/Opera/i)) {
                    this.browser.stock = false;
                    this.browser.name = 'Opera';

                    if (match = /Opera[\/| ]([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    if (match = /Version\/([0-9.]*)/.exec(ua)) {
                        if (parseFloat(match[1]) >= 10) {
                            this.browser.version = new Version({
                                value: match[1]
                            });
                        } else {
                            this.browser.version = null;
                        }
                    }

                    if (this.browser.version && ua.match('Edition Labs')) {
                        this.browser.version.type = 'alpha';
                        this.browser.channel = 'Labs';
                    }

                    if (this.browser.version && ua.match('Edition Next')) {
                        this.browser.version.type = 'alpha';
                        this.browser.channel = 'Next';
                    }

                    if (ua.match('Opera Tablet')) {
                        this.browser.name = 'Opera Mobile';
                        this.device.type = 'tablet';
                    }

                    if (ua.match('Opera Mobi')) {
                        this.browser.name = 'Opera Mobile';
                        this.device.type = 'mobile';
                    }

                    if (match = /Opera Mini;/.exec(ua)) {
                        this.browser.name = 'Opera Mini';
                        this.browser.version = null;
                        this.browser.mode = 'proxy';
                        this.device.type = 'mobile';
                    }

                    if (match = /Opera Mini\/(?:att\/)?([0-9.]*)/.exec(ua)) {
                        this.browser.name = 'Opera Mini';
                        this.browser.version = new Version({
                            value: match[1],
                            details: -1
                        });
                        this.browser.mode = 'proxy';
                        this.device.type = 'mobile';
                    }

                    if (this.browser.name === 'Opera' && this.device.type === 'mobile') {
                        this.browser.name = 'Opera Mobile';

                        if (ua.match(/BER/)) {
                            this.browser.name = 'Opera Mini';
                            this.browser.version = null;
                        }
                    }

                    if (ua.match('InettvBrowser')) {
                        this.device.type = 'television';
                    }

                    if (ua.match('Opera TV') || ua.match('Opera-TV')) {
                        this.browser.name = 'Opera';
                        this.device.type = 'television';
                    }

                    if (ua.match('Linux zbov')) {
                        this.browser.name = 'Opera Mobile';
                        this.browser.mode = 'desktop';

                        this.device.type = 'mobile';

                        this.os.name = null;
                        this.os.version = null;
                    }

                    if (ua.match('Linux zvav')) {
                        this.browser.name = 'Opera Mini';
                        this.browser.version = null;
                        this.browser.mode = 'desktop';

                        this.device.type = 'mobile';

                        this.os.name = null;
                        this.os.version = null;
                    }
                }

                /****************************************************
                 *      Firefox
                 */

                if (ua.match('Firefox')) {
                    this.browser.stock = false;
                    this.browser.name = 'Firefox';

                    if (match = /Firefox\/([0-9ab.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    if (this.browser.version.type === 'alpha') {
                        this.browser.channel = 'Aurora';
                    }

                    if (this.browser.version.type === 'beta') {
                        this.browser.channel = 'Beta';
                    }

                    if (ua.match('Fennec')) {
                        this.device.type = 'mobile';
                    }

                    if (ua.match('Mobile; rv')) {
                        this.device.type = 'mobile';
                    }

                    if (ua.match('Tablet; rv')) {
                        this.device.type = 'tablet';
                    }

                    if (this.device.type === 'mobile' || this.device.type === 'tablet') {
                        this.browser.name = 'Firefox Mobile';
                    }
                }

                if (ua.match('Namoroka')) {
                    this.browser.stock = false;
                    this.browser.name = 'Firefox';

                    if (match = /Namoroka\/([0-9ab.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    this.browser.channel = 'Namoroka';
                }

                if (ua.match('Shiretoko')) {
                    this.browser.stock = false;
                    this.browser.name = 'Firefox';

                    if (match = /Shiretoko\/([0-9ab.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    this.browser.channel = 'Shiretoko';
                }

                if (ua.match('Minefield')) {
                    this.browser.stock = false;
                    this.browser.name = 'Firefox';

                    if (match = /Minefield\/([0-9ab.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    this.browser.channel = 'Minefield';
                }

                if (ua.match('Firebird')) {
                    this.browser.stock = false;
                    this.browser.name = 'Firebird';

                    if (match = /Firebird\/([0-9ab.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      SeaMonkey
                 */

                if (ua.match('SeaMonkey')) {
                    this.browser.stock = false;
                    this.browser.name = 'SeaMonkey';

                    if (match = /SeaMonkey\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Netscape
                 */

                if (ua.match('Netscape')) {
                    this.browser.stock = false;
                    this.browser.name = 'Netscape';

                    if (match = /Netscape[0-9]?\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Konqueror
                 */

                if (ua.match('[k|K]onqueror/')) {
                    this.browser.name = 'Konqueror';

                    if (match = /[k|K]onqueror\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Chrome
                 */

                if (match = /(?:Chrome|CrMo|CriOS)\/([0-9.]*)/.exec(ua)) {
                    this.browser.stock = false;
                    this.browser.name = 'Chrome';
                    this.browser.version = new Version({
                        value: match[1]
                    });

                    if (this.os.name === 'Android') {
                        switch (match[1].split('.', 3).join('.')) {
                            case '16.0.912':
                                this.browser.channel = 'Beta';
                                break;
                            case '18.0.1025':
                                this.browser.version.details = 1;
                                break;
                            default:
                                this.browser.channel = 'Nightly';
                                break;
                        }
                    } else {
                        switch (match[1].split('.', 3).join('.')) {
                            case '0.2.149':
                            case '0.3.154':
                            case '0.4.154':
                            case '1.0.154':
                            case '2.0.172':
                            case '3.0.195':
                            case '4.0.249':
                            case '4.1.249':
                            case '5.0.375':
                            case '6.0.472':
                            case '7.0.517':
                            case '8.0.552':
                            case '9.0.597':
                            case '10.0.648':
                            case '11.0.696':
                            case '12.0.742':
                            case '13.0.782':
                            case '14.0.835':
                            case '15.0.874':
                            case '16.0.912':
                            case '17.0.963':
                            case '18.0.1025':
                            case '19.0.1084':
                            case '20.0.1132':
                            case '21.0.1180':
                                if (this.browser.version.minor === 0) this.browser.version.details = 1;
                                else this.browser.version.details = 2;

                                break;
                            default:
                                this.browser.channel = 'Nightly';
                                break;
                        }
                    }
                }

                /****************************************************
                 *      Chrome Frame
                 */

                if (ua.match('chromeframe')) {
                    this.browser.stock = false;
                    this.browser.name = 'Chrome Frame';

                    if (match = /chromeframe\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Chromium
                 */

                if (ua.match('Chromium')) {
                    this.browser.stock = false;
                    this.browser.channel = '';
                    this.browser.name = 'Chromium';

                    if (match = /Chromium\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      BrowserNG
                 */

                if (ua.match('BrowserNG')) {
                    this.browser.name = 'Nokia Browser';

                    if (match = /BrowserNG\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1],
                            details: 3,
                            builds: false
                        });
                    }
                }

                /****************************************************
                 *      Nokia Browser
                 */

                if (ua.match('NokiaBrowser')) {
                    this.browser.name = 'Nokia Browser';

                    if (match = /NokiaBrowser\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1],
                            details: 3
                        });
                    }
                }

                /****************************************************
                 *      MicroB
                 */

                if (ua.match('Maemo[ |_]Browser')) {
                    this.browser.name = 'MicroB';

                    if (match = /Maemo[ |_]Browser[ |_]([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1],
                            details: 3
                        });
                    }
                }


                /****************************************************
                 *      NetFront
                 */

                if (ua.match('NetFront')) {
                    this.browser.name = 'NetFront';
                    this.device.type = 'mobile';

                    if (match = /NetFront\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    if (ua.match('InettvBrowser')) {
                        this.device.type = 'television';
                    }
                }

                /****************************************************
                 *      Silk
                 */

                if (ua.match('Silk')) {
                    if (ua.match('Silk-Accelerated')) {
                        this.browser.name = 'Silk';

                        if (match = /Silk\/([0-9.]*)/.exec(ua)) {
                            this.browser.version = new Version({
                                value: match[1],
                                details: 2
                            });
                        }

                        this.device.manufacturer = 'Amazon';
                        this.device.model = 'Kindle Fire';
                        this.device.type = 'tablet';
                        this.device.identified = true;

                        if (this.os.name !== 'Android') {
                            this.os.name = 'Android';
                            this.os.version = null;
                        }
                    }
                }

                /****************************************************
                 *      Dolfin
                 */

                if (ua.match('Dolfin')) {
                    this.browser.name = 'Dolfin';

                    if (match = /Dolfin\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }


                /****************************************************
                 *      Iris
                 */

                if (ua.match('Iris')) {
                    this.browser.name = 'Iris';

                    this.device.type = 'mobile';
                    this.device.model = null;
                    this.device.manufacturer = null;

                    this.os.name = 'Windows Mobile';
                    this.os.version = null;

                    if (match = /Iris\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    if (match = / WM([0-9]) /.exec(ua)) {
                        this.os.version = new Version({
                            value: match[1] + '.0'
                        });
                    } else {
                        this.browser.mode = 'desktop';
                    }
                }

                /****************************************************
                 *      Jasmine
                 */

                if (ua.match('Jasmine')) {
                    this.browser.name = 'Jasmine';

                    if (match = /Jasmine\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Boxee
                 */

                if (ua.match('Boxee')) {
                    this.browser.name = 'Boxee';
                    this.device.type = 'television';

                    if (match = /Boxee\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Espial
                 */

                if (ua.match('Espial')) {
                    this.browser.name = 'Espial';

                    this.os.name = '';
                    this.os.version = null;

                    if (this.device.type !== 'television') {
                        this.device.type = 'television';
                        this.device.model = null;
                        this.device.manufacturer = null;
                    }

                    if (match = /Espial\/([0-9.]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      ANT Galio
                 */
                if (match = /ANTGalio\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'ANT Galio';
                    this.browser.version = new Version({
                        value: match[1],
                        details: 3
                    });
                    this.device.type = 'television';
                }

                /****************************************************
                 *      NetFront NX
                 */
                if (match = /NX\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'NetFront NX';
                    this.browser.version = new Version({
                        value: match[1],
                        details: 2
                    });
                    if (match = /DTV/i.exec(ua)) {
                        this.device.type = 'television';
                    } else if (match = /mobile/i.exec(ua)) {
                        this.device.type = 'mobile';
                    } else {
                        this.device.type = 'desktop';
                    }

                    this.os.name = null;
                    this.os.version = null;
                }

                /****************************************************
                 *      Obigo
                 */

                if (ua.match(/Obigo/i)) {
                    this.browser.name = 'Obigo';

                    if (match = /Obigo\/([0-9.]*)/i.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1]
                        });
                    }

                    if (match = /Obigo\/([A-Z])([0-9.]*)/i.exec(ua)) {
                        this.browser.name = 'Obigo ' + match[1];
                        this.browser.version = new Version({
                            value: match[2]
                        });
                    }

                    if (match = /Obigo-([A-Z])([0-9.]*)\//i.exec(ua)) {
                        this.browser.name = 'Obigo ' + match[1];
                        this.browser.version = new Version({
                            value: match[2]
                        });
                    }
                }

                /****************************************************
                 *      UC Web
                 */

                if (ua.match('UCWEB')) {
                    this.browser.stock = false;
                    this.browser.name = 'UC Browser';

                    if (match = /UCWEB([0-9]*[.][0-9]*)/.exec(ua)) {
                        this.browser.version = new Version({
                            value: match[1],
                            details: 3
                        });
                    }

                    if (this.os.name === 'Linux') {
                        this.os.name = '';
                    }

                    this.device.type = 'mobile';

                    if (match = /^IUC \(U;\s?iOS ([0-9\.]+);/.exec(ua)) {
                        this.os.name = 'iOS';
                        this.os.version = new Version({
                            value: match[1]
                        });
                    }

                    if (match = /^JUC \(Linux; U; ([0-9\.]+)[^;]*; [^;]+; ([^;]*[^\s])\s*; [0-9]+\*[0-9]+\)/.exec(ua)) {
                        var model = cleanupModel(match[2]);

                        this.os.name = 'Android';
                        this.os.version = new Version({
                            value: match[1]
                        });

                        if (typeof ANDROID_MODELS[model] !== 'undefined') {
                            this.device.manufacturer = ANDROID_MODELS[model][0];
                            this.device.model = ANDROID_MODELS[model][1];
                            if (typeof ANDROID_MODELS[model][2] !== 'undefined') this.device.type = ANDROID_MODELS[model][2];
                            this.device.identified = true;
                        }
                    }
                }

                if (ua.match(/\) UC /)) {
                    this.browser.stock = false;
                    this.browser.name = 'UC Browser';
                }

                if (match = /UCBrowser\/([0-9.]*)/.exec(ua)) {
                    this.browser.stock = false;
                    this.browser.name = 'UC Browser';
                    this.browser.version = new Version({
                        value: match[1],
                        details: 2
                    });
                }

                /****************************************************
                 *      NineSky
                 */

                if (match = /Ninesky(?:-android-mobile(?:-cn)?)?\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'NineSky';
                    this.browser.version = new Version({
                        value: match[1]
                    });

                    if (this.os.name !== 'Android') {
                        this.os.name = 'Android';
                        this.os.version = null;

                        this.device.manufacturer = null;
                        this.device.model = null;
                    }
                }

                /****************************************************
                 *      Skyfire
                 */

                if (match = /Skyfire\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'Skyfire';
                    this.browser.version = new Version({
                        value: match[1]
                    });

                    this.device.type = 'mobile';

                    this.os.name = 'Android';
                    this.os.version = null;
                }

                /****************************************************
                 *      Dolphin HD
                 */

                if (match = /DolphinHDCN\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'Dolphin';
                    this.browser.version = new Version({
                        value: match[1]
                    });

                    this.device.type = 'mobile';

                    if (this.os.name !== 'Android') {
                        this.os.name = 'Android';
                        this.os.version = null;
                    }
                }

                if (match = /Dolphin\/INT/.exec(ua)) {
                    this.browser.name = 'Dolphin';
                    this.device.type = 'mobile';
                }

                /****************************************************
                 *      QQ Browser
                 */

                if (match = /(M?QQBrowser)\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'QQ Browser';

                    var version = match[2];
                    if (version.match(/^[0-9][0-9]$/)) version = version[0] + '.' + version[1];

                    this.browser.version = new Version({
                        value: version,
                        details: 2
                    });
                    this.browser.channel = ''

                    if (!this.os.name && match[1] === 'QQBrowser') {
                        this.os.name = 'Windows';
                    }
                }

                /****************************************************
                 *      iBrowser
                 */

                if (match = /(iBrowser)\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'iBrowser';

                    var version = match[2];
                    if (version.match(/[0-9][0-9]/)) version = version[0] + '.' + version[1];

                    this.browser.version = new Version({
                        value: version,
                        details: 2
                    });
                    this.browser.channel = ''
                }

                /****************************************************
                 *      Puffin
                 */

                if (match = /Puffin\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'Puffin';
                    this.browser.version = new Version({
                        value: match[1],
                        details: 2
                    });

                    this.device.type = 'mobile';

                    if (this.os.name === 'Linux') {
                        this.os.name = null;
                        this.os.version = null;
                    }
                }

                /****************************************************
                 *      360 Extreme Explorer
                 */

                if (ua.match('360EE')) {
                    this.browser.stock = false;
                    this.browser.name = '360 Extreme Explorer';
                    this.browser.version = null;
                }

                /****************************************************
                 *      Midori
                 */

                if (match = /Midori\/([0-9.]*)/.exec(ua)) {
                    this.browser.name = 'Midori';
                    this.browser.version = new Version({
                        value: match[1]
                    });

                    if (this.os.name !== 'Linux') {
                        this.os.name = 'Linux';
                        this.os.version = null;
                    }

                    this.device.manufacturer = null;
                    this.device.model = null;
                    this.device.type = 'desktop';
                }

                /****************************************************
                 *      Others
                 */

                var browsers = [{
                    name: 'AdobeAIR',
                    regexp: /AdobeAIR\/([0-9.]*)/
                }, {
                    name: 'Awesomium',
                    regexp: /Awesomium\/([0-9.]*)/
                }, {
                    name: 'Canvace',
                    regexp: /Canvace Standalone\/([0-9.]*)/
                }, {
                    name: 'Ekioh',
                    regexp: /Ekioh\/([0-9.]*)/
                }, {
                    name: 'JavaFX',
                    regexp: /JavaFX\/([0-9.]*)/
                }, {
                    name: 'GFXe',
                    regexp: /GFXe\/([0-9.]*)/
                }, {
                    name: 'LuaKit',
                    regexp: /luakit/
                }, {
                    name: 'Titanium',
                    regexp: /Titanium\/([0-9.]*)/
                }, {
                    name: 'OpenWebKitSharp',
                    regexp: /OpenWebKitSharp/
                }, {
                    name: 'Prism',
                    regexp: /Prism\/([0-9.]*)/
                }, {
                    name: 'Qt',
                    regexp: /Qt\/([0-9.]*)/
                }, {
                    name: 'QtEmbedded',
                    regexp: /QtEmbedded/
                }, {
                    name: 'QtEmbedded',
                    regexp: /QtEmbedded.*Qt\/([0-9.]*)/
                }, {
                    name: 'RhoSimulator',
                    regexp: /RhoSimulator/
                }, {
                    name: 'UWebKit',
                    regexp: /UWebKit\/([0-9.]*)/
                },

                    {
                        name: 'PhantomJS',
                        regexp: /PhantomJS\/([0-9.]*)/
                    }, {
                        name: 'Google Web Preview',
                        regexp: /Google Web Preview/
                    },

                    {
                        name: 'Google Earth',
                        regexp: /Google Earth\/([0-9.]*)/
                    }, {
                        name: 'EA Origin',
                        regexp: /Origin\/([0-9.]*)/
                    }, {
                        name: 'SecondLife',
                        regexp: /SecondLife\/([0-9.]*)/
                    }, {
                        name: 'Valve Steam',
                        regexp: /Valve Steam/
                    },

                    {
                        name: 'Songbird',
                        regexp: /Songbird\/([0-9.]*)/
                    }, {
                        name: 'Thunderbird',
                        regexp: /Thunderbird\/([0-9.]*)/
                    },

                    {
                        name: 'Abrowser',
                        regexp: /Abrowser\/([0-9.]*)/
                    }, {
                        name: 'arora',
                        regexp: /[Aa]rora\/([0-9.]*)/
                    }, {
                        name: 'Baidu Browser',
                        regexp: /M?BaiduBrowser\/([0-9.]*)/i
                    }, {
                        name: 'Camino',
                        regexp: /Camino\/([0-9.]*)/
                    }, {
                        name: 'Canure',
                        regexp: /Canure\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'CometBird',
                        regexp: /CometBird\/([0-9.]*)/
                    }, {
                        name: 'Comodo Dragon',
                        regexp: /Comodo_Dragon\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'Conkeror',
                        regexp: /[Cc]onkeror\/([0-9.]*)/
                    }, {
                        name: 'CoolNovo',
                        regexp: /(?:CoolNovo|CoolNovoChromePlus)\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'ChromePlus',
                        regexp: /ChromePlus(?:\/([0-9.]*))?$/,
                        details: 3
                    }, {
                        name: 'Daedalus',
                        regexp: /Daedalus ([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'Demobrowser',
                        regexp: /demobrowser\/([0-9.]*)/
                    }, {
                        name: 'Dooble',
                        regexp: /Dooble(?:\/([0-9.]*))?/
                    }, {
                        name: 'DWB',
                        regexp: /dwb(?:-hg)?(?:\/([0-9.]*))?/
                    }, {
                        name: 'Epiphany',
                        regexp: /Epiphany\/([0-9.]*)/
                    }, {
                        name: 'FireWeb',
                        regexp: /FireWeb\/([0-9.]*)/
                    }, {
                        name: 'Flock',
                        regexp: /Flock\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'Galeon',
                        regexp: /Galeon\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'Helium',
                        regexp: /HeliumMobileBrowser\/([0-9.]*)/
                    }, {
                        name: 'iCab',
                        regexp: /iCab\/([0-9.]*)/
                    }, {
                        name: 'Iceape',
                        regexp: /Iceape\/([0-9.]*)/
                    }, {
                        name: 'IceCat',
                        regexp: /IceCat ([0-9.]*)/
                    }, {
                        name: 'Iceweasel',
                        regexp: /Iceweasel\/([0-9.]*)/
                    }, {
                        name: 'InternetSurfboard',
                        regexp: /InternetSurfboard\/([0-9.]*)/
                    }, {
                        name: 'Iron',
                        regexp: /Iron\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'Isis',
                        regexp: /BrowserServer/
                    }, {
                        name: 'Jumanji',
                        regexp: /jumanji/
                    }, {
                        name: 'Kazehakase',
                        regexp: /Kazehakase\/([0-9.]*)/
                    }, {
                        name: 'KChrome',
                        regexp: /KChrome\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'K-Meleon',
                        regexp: /K-Meleon\/([0-9.]*)/
                    }, {
                        name: 'Leechcraft',
                        regexp: /Leechcraft(?:\/([0-9.]*))?/,
                        details: 2
                    }, {
                        name: 'Lightning',
                        regexp: /Lightning\/([0-9.]*)/
                    }, {
                        name: 'Lunascape',
                        regexp: /Lunascape[\/| ]([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'iLunascape',
                        regexp: /iLunascape\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'Maxthon',
                        regexp: /Maxthon[\/ ]([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'MiniBrowser',
                        regexp: /MiniBr?owserM\/([0-9.]*)/
                    }, {
                        name: 'MiniBrowser',
                        regexp: /MiniBrowserMobile\/([0-9.]*)/
                    }, {
                        name: 'MixShark',
                        regexp: /MixShark\/([0-9.]*)/
                    }, {
                        name: 'Motorola WebKit',
                        regexp: /MotorolaWebKit\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'NetFront LifeBrowser',
                        regexp: /NetFrontLifeBrowser\/([0-9.]*)/
                    }, {
                        name: 'Netscape Navigator',
                        regexp: /Navigator\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'Odyssey',
                        regexp: /OWB\/([0-9.]*)/
                    }, {
                        name: 'OmniWeb',
                        regexp: /OmniWeb/
                    }, {
                        name: 'Orca',
                        regexp: /Orca\/([0-9.]*)/
                    }, {
                        name: 'Origyn',
                        regexp: /Origyn Web Browser/
                    }, {
                        name: 'Palemoon',
                        regexp: /Pale[mM]oon\/([0-9.]*)/
                    }, {
                        name: 'Phantom',
                        regexp: /Phantom\/V([0-9.]*)/
                    }, {
                        name: 'Polaris',
                        regexp: /Polaris\/v?([0-9.]*)/i,
                        details: 2
                    }, {
                        name: 'QtCreator',
                        regexp: /QtCreator\/([0-9.]*)/
                    }, {
                        name: 'QtQmlViewer',
                        regexp: /QtQmlViewer/
                    }, {
                        name: 'QtTestBrowser',
                        regexp: /QtTestBrowser\/([0-9.]*)/
                    }, {
                        name: 'QtWeb',
                        regexp: /QtWeb Internet Browser\/([0-9.]*)/
                    }, {
                        name: 'QupZilla',
                        regexp: /QupZilla\/([0-9.]*)/
                    }, {
                        name: 'Roccat',
                        regexp: /Roccat\/([0-9]\.[0-9.]*)/
                    }, {
                        name: 'Raven for Mac',
                        regexp: /Raven for Mac\/([0-9.]*)/
                    }, {
                        name: 'rekonq',
                        regexp: /rekonq/
                    }, {
                        name: 'RockMelt',
                        regexp: /RockMelt\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'Sleipnir',
                        regexp: /Sleipnir\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'SMBrowser',
                        regexp: /SMBrowser/
                    }, {
                        name: 'Sogou Explorer',
                        regexp: /SE 2.X MetaSr/
                    }, {
                        name: 'Snowshoe',
                        regexp: /Snowshoe\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'Sputnik',
                        regexp: /Sputnik\/([0-9.]*)/i,
                        details: 3
                    }, {
                        name: 'Stainless',
                        regexp: /Stainless\/([0-9.]*)/
                    }, {
                        name: 'SunChrome',
                        regexp: /SunChrome\/([0-9.]*)/
                    }, {
                        name: 'Surf',
                        regexp: /Surf\/([0-9.]*)/
                    }, {
                        name: 'TaoBrowser',
                        regexp: /TaoBrowser\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'TaomeeBrowser',
                        regexp: /TaomeeBrowser\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'TazWeb',
                        regexp: /TazWeb/
                    }, {
                        name: 'Viera',
                        regexp: /Viera\/([0-9.]*)/
                    }, {
                        name: 'Villanova',
                        regexp: /Villanova\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'Wavelink Velocity',
                        regexp: /Wavelink Velocity Browser\/([0-9.]*)/,
                        details: 2
                    }, {
                        name: 'WebPositive',
                        regexp: /WebPositive/
                    }, {
                        name: 'WebRender',
                        regexp: /WebRender/
                    }, {
                        name: 'Wyzo',
                        regexp: /Wyzo\/([0-9.]*)/,
                        details: 3
                    }, {
                        name: 'Zetakey',
                        regexp: /Zetakey Webkit\/([0-9.]*)/
                    }, {
                        name: 'Zetakey',
                        regexp: /Zetakey\/([0-9.]*)/
                    }]

                for (var b = 0; b < browsers.length; b++) {
                    if (match = browsers[b].regexp.exec(ua)) {
                        this.browser.name = browsers[b].name;
                        this.browser.channel = '';
                        this.browser.stock = false;

                        if (match[1]) {
                            this.browser.version = new Version({
                                value: match[1],
                                details: browsers[b].details || null
                            });
                        } else {
                            this.browser.version = null;
                        }
                    }
                }


                /****************************************************
                 *      WebKit
                 */

                if (match = /WebKit\/([0-9.]*)/i.exec(ua)) {
                    this.engine.name = 'Webkit';
                    this.engine.version = new Version({
                        value: match[1]
                    });
                }

                if (match = /Browser\/AppleWebKit([0-9.]*)/i.exec(ua)) {
                    this.engine.name = 'Webkit';
                    this.engine.version = new Version({
                        value: match[1]
                    });
                }

                /****************************************************
                 *      KHTML
                 */

                if (match = /KHTML\/([0-9.]*)/.exec(ua)) {
                    this.engine.name = 'KHTML';
                    this.engine.version = new Version({
                        value: match[1]
                    });
                }

                /****************************************************
                 *      Gecko
                 */

                if (/Gecko/.exec(ua) && !/like Gecko/i.exec(ua)) {
                    this.engine.name = 'Gecko';

                    if (match = /; rv:([^\)]+)\)/.exec(ua)) {
                        this.engine.version = new Version({
                            value: match[1]
                        });
                    }
                }

                /****************************************************
                 *      Presto
                 */

                if (match = /Presto\/([0-9.]*)/.exec(ua)) {
                    this.engine.name = 'Presto';
                    this.engine.version = new Version({
                        value: match[1]
                    });
                }

                /****************************************************
                 *      Trident
                 */

                if (match = /Trident\/([0-9.]*)/.exec(ua)) {
                    this.engine.name = 'Trident';
                    this.engine.version = new Version({
                        value: match[1]
                    });

                    if (this.browser.name === 'Internet Explorer') {
                        if (parseVersion(this.engine.version) === 6 && parseFloat(this.browser.version) < 10) {
                            this.browser.version = new Version({
                                value: '10.0'
                            });
                            this.browser.mode = 'compat';
                        }

                        if (parseVersion(this.engine.version) === 5 && parseFloat(this.browser.version) < 9) {
                            this.browser.version = new Version({
                                value: '9.0'
                            });
                            this.browser.mode = 'compat';
                        }

                        if (parseVersion(this.engine.version) === 4 && parseFloat(this.browser.version) < 8) {
                            this.browser.version = new Version({
                                value: '8.0'
                            });
                            this.browser.mode = 'compat';
                        }
                    }

                    if (this.os.name === 'Windows Phone') {
                        if (parseVersion(this.engine.version) === 5 && parseFloat(this.os.version) < 7.5) {
                            this.os.version = new Version({
                                value: '7.5'
                            });
                        }
                    }
                }


                /****************************************************
                 *      Corrections
                 */

                if (this.os.name === 'Android' && this.browser.stock) {
                    this.browser.hidden = true;
                }

                if (this.os.name === 'iOS' && this.browser.name === 'Opera Mini') {
                    this.os.version = null;
                }

                if (this.browser.name === 'Midori' && this.engine.name !== 'Webkit') {
                    this.engine.name = 'Webkit';
                    this.engine.version = null;
                }

                if (this.device.type === 'television' && this.browser.name === 'Opera') {
                    this.browser.name = 'Opera Devices';
                    switch (true) {
                        case this.engine.version.is('2.10'):
                            this.browser.version = new Version({
                                value: 3.2
                            });
                            break;
                        case this.engine.version.is('2.9'):
                            this.browser.version = new Version({
                                value: 3.1
                            });
                            break;
                        case this.engine.version.is('2.8'):
                            this.browser.version = new Version({
                                value: 3.0
                            });
                            break;
                        case this.engine.version.is('2.7'):
                            this.browser.version = new Version({
                                value: 2.9
                            });
                            break;
                        case this.engine.version.is('2.6'):
                            this.browser.version = new Version({
                                value: 2.8
                            });
                            break;
                        case this.engine.version.is('2.4'):
                            this.browser.version = new Version({
                                value: 10.3
                            });
                            break;
                        case this.engine.version.is('2.3'):
                            this.browser.version = new Version({
                                value: 10
                            });
                            break;
                        case this.engine.version.is('2.2'):
                            this.browser.version = new Version({
                                value: 9.7
                            });
                            break;
                        case this.engine.version.is('2.1'):
                            this.browser.version = new Version({
                                value: 9.6
                            });
                            break;
                        default:
                            this.browser.version = null;
                    }

                    this.os.name = null;
                    this.os.version = null;
                }


                /****************************************************
                 *      Camouflage
                 */

                if (this.options.detectCamouflage) {

                    if (match = /Mac OS X 10_6_3; ([^;]+); [a-z]{2}-(?:[a-z]{2})?\)/.exec(ua)) {
                        this.browser.name = '';
                        this.browser.version = null;
                        this.browser.mode = 'desktop';

                        this.os.name = 'Android';
                        this.os.version = null;

                        this.engine.name = 'Webkit';
                        this.engine.version = null;

                        this.device.model = match[1];
                        this.device.type = 'mobile';

                        var model = cleanupModel(this.device.model);
                        if (typeof ANDROID_MODELS[model] !== 'undefined') {
                            this.device.manufacturer = ANDROID_MODELS[model][0];
                            this.device.model = ANDROID_MODELS[model][1];
                            if (typeof ANDROID_MODELS[model][2] !== 'undefined') this.device.type = ANDROID_MODELS[model][2];
                            this.device.identified = true;
                        }

                        this.features.push('foundDevice');
                    }

                    if (match = /Linux Ventana; [a-z]{2}-[a-z]{2}; (.+) Build/.exec(ua)) {
                        this.browser.name = '';
                        this.browser.version = null;
                        this.browser.mode = 'desktop';

                        this.os.name = 'Android';
                        this.os.version = null;

                        this.engine.name = 'Webkit';
                        this.engine.version = null;

                        this.device.model = match[1];
                        this.device.type = 'mobile';

                        var model = cleanupModel(this.device.model);
                        if (typeof ANDROID_MODELS[model] !== 'undefined') {
                            this.device.manufacturer = ANDROID_MODELS[model][0];
                            this.device.model = ANDROID_MODELS[model][1];
                            if (typeof ANDROID_MODELS[model][2] !== 'undefined') this.device.type = ANDROID_MODELS[model][2];
                            this.device.identified = true;
                        }

                        this.features.push('foundDevice');
                    }

                    if (this.browser.name === 'Safari') {
                        if (this.os.name !== 'iOS' && /AppleWebKit\/([0-9]+.[0-9]+)/i.exec(ua)[1] !== /Safari\/([0-9]+.[0-9]+)/i.exec(ua)[1]) {
                            this.features.push('safariMismatch');
                            this.camouflage = true;
                        }

                        if (this.os.name === 'iOS' && !ua.match(/^Mozilla/)) {
                            this.features.push('noMozillaPrefix');
                            this.camouflage = true;
                        }

                        if (!/Version\/[0-9\.]+/.exec(ua)) {
                            this.features.push('noVersion');
                            this.camouflage = true;
                        }
                    }

                    if (this.browser.name === 'Chrome') {
                        if (!/(?:Chrome|CrMo|CriOS)\/([0-9]{1,2}\.[0-9]\.[0-9]{3,4}\.[0-9]+)/.exec(ua)) {
                            this.features.push('wrongVersion');
                            this.camouflage = true;
                        }
                    }


                    if (this.options.useFeatures) {
                        /* If it claims not to be Trident, but it is probably Trident running camouflage mode */
                        if (window.ActiveXObject) {
                            this.features.push('trident');

                            if (typeof this.engine.name !== 'undefined' && this.engine.name !== 'Trident') {
                                this.camouflage = typeof this.browser.name === 'undefined' || this.browser.name !== 'Maxthon';
                            }
                        }

                        /* If it claims not to be Opera, but it is probably Opera running camouflage mode */
                        if (window.opera) {
                            this.features.push('presto');

                            if (typeof this.engine.name !== 'undefined' && this.engine.name !== 'Presto') {
                                this.camouflage = true;
                            }

                            if (this.browser.name === 'Internet Explorer') {
                                this.camouflage = true;
                            }
                        }

                        /* If it claims not to be Gecko, but it is probably Gecko running camouflage mode */
                        if ('getBoxObjectFor' in document || 'mozInnerScreenX' in window) {
                            this.features.push('gecko');

                            if (typeof this.engine.name !== 'undefined' && this.engine.name !== 'Gecko') {
                                this.camouflage = true;
                            }

                            if (this.browser.name === 'Internet Explorer') {
                                this.camouflage = true;
                            }
                        }

                        /* If it claims not to be Webkit, but it is probably Webkit running camouflage mode */
                        if ('WebKitCSSMatrix' in window || 'WebKitPoint' in window || 'webkitStorageInfo' in window || 'webkitURL' in window) {
                            this.features.push('webkit');

                            if (typeof this.engine.name !== 'undefined' && this.engine.name !== 'Webkit') {
                                this.camouflage = true;
                            }

                            if (this.browser.name === 'Internet Explorer') {
                                this.camouflage = true;
                            }
                        }


                        /* If it claims to be Safari and uses V8, it is probably an Android device running camouflage mode */
                        if (this.engine.name === 'Webkit' && ({}.toString).toString().indexOf('\n') === -1) {
                            this.features.push('v8');

                            if (this.browser !== null && this.browser.name === 'Safari') {
                                this.camouflage = true;
                            }
                        }


                        /* If we have an iPad that is not 768 x 1024, we have an imposter */
                        if (this.device.model === 'iPad') {
                            if ((screen.width !== 0 && screen.height !== 0) && (screen.width !== 768 && screen.height !== 1024) && (screen.width !== 1024 && screen.height !== 768)) {
                                this.features.push('sizeMismatch');
                                this.camouflage = true;
                            }
                        }

                        /* If we have an iPhone or iPod that is not 320 x 480, we have an imposter */
                        if (this.device.model === 'iPhone' || this.device.model === 'iPod') {
                            if ((screen.width !== 0 && screen.height !== 0) && (screen.width !== 320 && screen.height !== 480) && (screen.width !== 480 && screen.height !== 320)) {
                                this.features.push('sizeMismatch');
                                this.camouflage = true;
                            }
                        }


                        if (this.os.name === 'iOS' && this.os.version) {

                            if (this.os.version.isOlder('4.0') && 'sandbox' in document.createElement('iframe')) {
                                this.features.push('foundSandbox');
                                this.camouflage = true;
                            }

                            if (this.os.version.isOlder('4.2') && 'WebSocket' in window) {
                                this.features.push('foundSockets');
                                this.camouflage = true;
                            }

                            if (this.os.version.isOlder('5.0') && !!window.Worker) {
                                this.features.push('foundWorker');
                                this.camouflage = true;
                            }

                            if (this.os.version.isNewer('2.1') && !window.applicationCache) {
                                this.features.push('noAppCache');
                                this.camouflage = true;
                            }
                        }

                        if (this.os.name !== 'iOS' && this.browser.name === 'Safari' && this.browser.version) {

                            if (this.browser.version.isOlder('4.0') && !!window.applicationCache) {
                                this.features.push('foundAppCache');
                                this.camouflage = true;
                            }

                            if (this.browser.version.isOlder('4.1') && !!(window.history && history.pushState)) {
                                this.features.push('foundHistory');
                                this.camouflage = true;
                            }

                            if (this.browser.version.isOlder('5.1') && !!document.documentElement.webkitRequestFullScreen) {
                                this.features.push('foundFullscreen');
                                this.camouflage = true;
                            }

                            if (this.browser.version.isOlder('5.2') && 'FileReader' in window) {
                                this.features.push('foundFileReader');
                                this.camouflage = true;
                            }
                        }
                    }
                }
            }
        };

        function cleanupModel(s) {
            s = typeof s === 'undefined' ? '' : s;

            s = s.replace(/_TD$/, '');
            s = s.replace(/_CMCC$/, '');

            s = s.replace(/_/g, ' ');
            s = s.replace(/^\s+|\s+$/g, '');
            s = s.replace(/\/[^/]+$/, '');
            s = s.replace(/\/[^/]+ Android\/.*/, '');

            s = s.replace(/^tita on /, '');
            s = s.replace(/^Android on /, '');
            s = s.replace(/^Android for /, '');
            s = s.replace(/^ICS AOSP on /, '');
            s = s.replace(/^Full AOSP on /, '');
            s = s.replace(/^Full Android on /, '');
            s = s.replace(/^Full Cappuccino on /, '');
            s = s.replace(/^Full MIPS Android on /, '');
            s = s.replace(/^Full Android/, '');

            s = s.replace(/^Acer ?/i, '');
            s = s.replace(/^Iconia /, '');
            s = s.replace(/^Ainol /, '');
            s = s.replace(/^Coolpad ?/i, 'Coolpad ');
            s = s.replace(/^ALCATEL /, '');
            s = s.replace(/^Alcatel OT-(.*)/, 'one touch $1');
            s = s.replace(/^YL-/, '');
            s = s.replace(/^Novo7 ?/i, 'Novo7 ');
            s = s.replace(/^GIONEE /, '');
            s = s.replace(/^HW-/, '');
            s = s.replace(/^Huawei[ -]/i, 'Huawei ');
            s = s.replace(/^SAMSUNG[ -]/i, '');
            s = s.replace(/^SonyEricsson/, '');
            s = s.replace(/^Lenovo Lenovo/, 'Lenovo');
            s = s.replace(/^LNV-Lenovo/, 'Lenovo');
            s = s.replace(/^Lenovo-/, 'Lenovo ');
            s = s.replace(/^(LG)[ _\/]/, '$1-');
            s = s.replace(/^(HTC.*)\s(?:v|V)?[0-9.]+$/, '$1');
            s = s.replace(/^(HTC)[-\/]/, '$1 ');
            s = s.replace(/^(HTC)([A-Z][0-9][0-9][0-9])/, '$1 $2');
            s = s.replace(/^(Motorola[\s|-])/, '')
            s = s.replace(/^(Moto|MOT-)/, '')

            s = s.replace(/-?(orange(-ls)?|vodafone|bouygues)$/i, '');
            s = s.replace(/http:\/\/.+$/i, '');

            s = s.replace(/^\s+|\s+$/g, '');

            return s;
        }

        function parseVersion(version) {
            version = version.toString();
            var components = version.split('.');
            var major = components.shift();
            return parseFloat(major + '.' + components.join(''));
        }

        return Detected;
    })();

    //userAgent
    var userAgent = function (ua) {
        var uaData = new userAgentBase(ua);
        var match;
        var tmpMatch;
        // handle mobile device
        if (uaData.device.type === 'mobile' || uaData.device.type === 'tablet') {

            // get manufacturer through the key words
            if (match = ua.match(/(ZTE|Samsung|Motorola|HTC|Coolpad|Huawei|Lenovo|LG|Sony Ericsson|Oppo|TCL|Vivo|Sony|Meizu|Nokia)/i)) {
                uaData.device.manufacturer = match[1];
                if (uaData.device.model && uaData.device.model.indexOf(match[1]) >= 0) {
                    uaData.device.model = uaData.device.model.replace(match[1], '');
                }
            }
            // handle Apple
            // 苹果就这3种iPod iPad iPhone
            if (match = ua.match(/(iPod|iPad|iPhone)/i)) {
                uaData.device.manufacturer = 'Apple';
                uaData.device.model = match[1];
            }
                // handle Samsung
                // 特殊型号可能以xxx-开头 或者直接空格接型号 兼容build结尾或直接)结尾
                // Galaxy nexus才是三星 nexus是google手机
            // 三星手机类型：galaxy xxx|SM-xxx|GT-xxx|SCH-xxx|SGH-xxx|SPH-xxx|SHW-xxx  若这些均未匹配到，则启用在中关村在线爬取到的机型白名单进行判断
            else if (match = ua.match(/[-\s](Galaxy[\s-_]nexus|Galaxy[\s-_]\w*[\s-_]\w*|Galaxy[\s-_]\w*|SM-\w*|GT-\w*|s[cgp]h-\w*|shw-\w*|ATIV|i9070|omnia|s7568|A3000|A3009|A5000|A5009|A7000|A7009|A8000|C101|C1116|C1158|E400|E500F|E7000|E7009|G3139D|G3502|G3502i|G3508|G3508J|G3508i|G3509|G3509i|G3558|G3559|G3568V|G3586V|G3589W|G3606|G3608|G3609|G3812|G388F|G5108|G5108Q|G5109|G5306W|G5308W|G5309W|G550|G600|G7106|G7108|G7108V|G7109|G7200|G720NO|G7508Q|G7509|G8508S|G8509V|G9006V|G9006W|G9008V|G9008W|G9009D|G9009W|G9198|G9200|G9208|G9209|G9250|G9280|I535|I679|I739|I8190N|I8262|I879|I879E|I889|I9000|I9060|I9082|I9082C|I9082i|I9100|I9100G|I9108|I9128|I9128E|I9128i|I9152|I9152P|I9158|I9158P|I9158V|I9168|I9168i|I9190|I9192|I9195|I9195I|I9200|I9208|I9220|I9228|I9260|I9268|I9300|I9300i|I9305|I9308|I9308i|I939|I939D|I939i|I9500|I9502|I9505|I9507V|I9508|I9508V|I959|J100|J110|J5008|J7008|N7100|N7102|N7105|N7108|N7108D|N719|N750|N7505|N7506V|N7508V|N7509V|N900|N9002|N9005|N9006|N9008|N9008S|N9008V|N9009|N9100|N9106W|N9108V|N9109W|N9150|N916|N9200|P709|P709E|P729|S6358|S7278|S7278U|S7562C|S7562i|S7898i|b9388)[\s\)]/i)) {
                uaData.device.manufacturer = 'Samsung';
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z]+[0-9]+[A-Z]*, 例如 G9006 G9006V 其实应该是G9006 另外三星只保留3位
                uaData.device.model = match[1].replace(/Galaxy S VI/i, 'Galaxy S6')
                    .replace(/Galaxy S V/i, 'Galaxy S5')
                    .replace(/Galaxy S IV/i, 'Galaxy S4')
                    .replace(/Galaxy s III/i, 'Galaxy S3')
                    .replace(/Galaxy S II/i, 'Galaxy S2')
                    .replace(/Galaxy S I/i, 'Galaxy S1')
                    .replace(/([a-z]+[0-9]{3})[0-9]?[a-z]*/i, '$1');
            }
            // 针对三星已经匹配出的数据做处理
            else if (uaData.device.manufacturer && uaData.device.manufacturer.toLowerCase() === 'samsung' && uaData.device.model) {
                uaData.device.model = uaData.device.model.replace(/Galaxy S VI/i, 'Galaxy S6')
                    .replace(/Galaxy S V/i, 'Galaxy S5')
                    .replace(/Galaxy S IV/i, 'Galaxy S4')
                    .replace(/Galaxy s III/i, 'Galaxy S3')
                    .replace(/Galaxy S II/i, 'Galaxy S2')
                    .replace(/Galaxy S I/i, 'Galaxy S1')
                    .replace(/([a-z]+[0-9]{3})[0-9]?[a-z]*/i, '$1');
            }
                // handle Huawei
                // 兼容build结尾或直接)结尾
            // 华为机型特征：Huawei[\s-_](\w*[-_]?\w*)  或者以 7D-  ALE-  CHE-等开头
            else if (match = ua.match(/(Huawei[\s-_](\w*[-_]?\w*)|\s(7D-\w*|ALE-\w*|ATH-\w*|CHE-\w*|CHM-\w*|Che1-\w*|Che2-\w*|D2-\w*|G616-\w*|G620S-\w*|G621-\w*|G660-\w*|G750-\w*|GRA-\w*|Hol-\w*|MT2-\w*|MT7-\w*|PE-\w*|PLK-\w*|SC-\w*|SCL-\w*|H60-\w*|H30-\w*)[\s\)])/i)) {
                uaData.device.manufacturer = 'Huawei';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：xxx-[A-Z][0-9]+ 例如  H30-L01  H30-L00  H30-L20  都应该是 H30-L
                // h30-l  h30-h  h30-t 都是H30
                if (match = uaData.device.model.match(/(\w*)[\s-_]+[a-z0-9]+/i)) {
                    uaData.device.model = match[1];
                }
            }
                // handle Xiaomi
                // 兼容build结尾或直接)结尾 以及特殊的HM处理方案(build/hm2013011)
                // xiaomi手机类型: mi m1 m2 m3 hm 开头
            // hongmi有特殊判断build/hm2015011
            else if (match = ua.match(/;\s(mi|m1|m2|m3|m4|hm)(\s*\w*)[\s\)]/i)) {
                if (tmpMatch = ua.match(/(meitu|MediaPad)/i)) {
                    // 美图手机名字冒充小米 比如 meitu m4 mizhi
                    uaData.device.manufacturer = tmpMatch[1];
                    uaData.device.model = '';
                }
                // 若匹配出的 match[2]没空格 会出现很多例如 mizi mizhi miha 但也会出现mi3 minote之类 特殊处理下
                else if (match[2].length > 0 && !((/\s/).test(match[2]))) {
                    if (tmpMatch = match[2].match(/(\d)/i)) {
                        uaData.device.model = match[1] + '-' + tmpMatch[1];
                    }
                } else {
                    uaData.device.manufacturer = 'Xiaomi';
                    if (match[2] && match[2].length > 0) {
                        match[2] = match[2].replace(/\s/, '');
                        uaData.device.model = (match[1].substr(match[1].length - 2) + '-' + match[2]).replace(/m(\d)-/i, 'MI-$1');
                    } else {
                        uaData.device.model = (match[1].substr(match[1].length - 2)).replace(/m(\d)/i, 'MI-$1');
                    }

                    // 解决移动联通等不同发行版导致的机型不同问题
                    // 特征：mi-3c,例如mi-4LTE mi-4 其实应该是 mi-4
                    if (/(mi|hm)(-\d)/i.test(uaData.device.model)) {
                        // 看看是不是 MI-3S  MI-4S....
                        if (match = uaData.device.model.match(/(mi|hm)(-\ds)/i)) {
                            uaData.device.model = match[1] + match[2];
                        }
                        // 防止 MI-20150XX等滥竽充数成为MI-2
                        else if (match = uaData.device.model.match(/(mi|hm)(-\d{2})/i)) {
                            uaData.device.model = match[1];
                        }
                        // 将mi-3c mi-3a mi-3w等合为mi-3
                        else if (match = uaData.device.model.match(/(mi|hm)(-\d)[A-Z]/i)) {
                            uaData.device.model = match[1] + match[2];
                        }
                    }
                    // 去除 mi-4g这样的东西
                    if (match = uaData.device.model.match(/(mi|hm)(-\dg)/i)) {
                        uaData.device.model = match[1];
                    }
                }
            } else if (/build\/HM\d{0,7}\)/i.test(ua)) {
                uaData.device.manufacturer = 'Xiaomi';
                uaData.device.model = 'HM';
            } else if (match = ua.match(/redmi\s?(\d+)?/i)) {
                uaData.device.manufacturer = 'Xiaomi';
                uaData.device.model = 'HM-' + match[1];
            } else if (uaData.device.manufacturer && uaData.device.manufacturer.toLowerCase() === 'xiaomi' && uaData.device.model) {
                // 针对通过base库判断出数据时命名风格不同。特殊处理适配如下
                if (match = uaData.device.model.match(/mi-one/i)) {
                    uaData.device.model = 'MI-1';
                }
                // mi 2
                else if (match = uaData.device.model.match(/mi-two/i)) {
                    uaData.device.model = 'MI-2';
                }
                // 20150xxx2014501
                else if (match = uaData.device.model.match(/\d{6}/i)) {
                    uaData.device.model = '';
                } else if (match = uaData.device.model.match(/redmi/i)) {
                    uaData.device.model = uaData.device.model.toUpperCase().replace(/redmi/i, 'HM');
                }
                // m1 m2 m3 写法不标准 另外判断是否是 m1-s
                else if (match = uaData.device.model.match(/(m\d)[\s-_](s?)/i)) {
                    uaData.device.model = match[1].replace(/m/, 'MI-') + match[2];
                }
                // mi-2w  mi-3w 等格式化为mi-2  mi-3
                else if (match = uaData.device.model.match(/(hm|mi)[\s-_](\d?)[a-rt-z]/i)) {
                    if (tmpMatch = uaData.device.model.match(/(mi|hm)[\s-_](note|pad)(\d?s?)/i)) {
                        uaData.device.model = tmpMatch[1] + '-' + tmpMatch[2] + tmpMatch[3];
                    } else {
                        uaData.device.model = match[2] ? match[1] + '-' + match[2] : match[1];
                    }
                }
                // 处理hm
                else if (match = uaData.device.model.match(/hm/i)) {
                    // 判断是不是 hm-201xxx充数
                    if (match = uaData.device.model.match(/(hm)[\s-_](\d{2})/i)) {
                        uaData.device.model = 'HM';
                    }
                    // 判断是不是 hm-2s hm-1s
                    else if (match = uaData.device.model.match(/(hm)[\s-_](\ds)/i)) {
                        uaData.device.model = 'HM-' + match[2];
                    } else if (match = uaData.device.model.match(/(hm)[\s-_](\d)[a-z]/i)) {
                        uaData.device.model = 'HM-' + match[2];
                    } else {
                        uaData.device.model = 'HM';
                    }
                    // 过滤类似 2g 3g等数据
                    if (/hm-\dg/.test(uaData.device.model)) {
                        uaData.device.model = 'HM';
                    }
                }
            }
                // handle Vivo
                // 兼容build结尾或直接)结尾
            // vivo机型特征: Vivo[\s-_](\w*)  或者以 E1  S11t  S7t 等开头
            else if (match = ua.match(/(vivo[\s-_](\w*)|\s(E1\w?|E3\w?|E5\w?|V1\w?|V2\w?|S11\w?|S12\w?|S1\w?|S3\w?|S6\w?|S7\w?|S9\w?|X1\w?|X3\w?|X520\w?|X5\w?|X5Max|X5Max+|X5Pro|X5SL|X710F|X710L|Xplay|Xshot|Xpaly3S|Y11\w?|Y11i\w?|Y11i\w?|Y13\w?|Y15\w?|Y17\w?|Y18\w?|Y19\w?|Y1\w?|Y20\w?|Y22\w?|Y22i\w?|Y23\w?|Y27\w?|Y28\w?|Y29\w?|Y33\w?|Y37\w?|Y3\w?|Y613\w?|Y622\w?|Y627\w?|Y913\w?|Y923\w?|Y927\w?|Y928\w?|Y929\w?|Y937\w?)[\s\)])/i)) {
                uaData.device.manufacturer = 'Vivo';
                uaData.device.model = match[1];
                // 首先剔除 viv-  vivo-  bbg- 等打头的内容
                uaData.device.model = uaData.device.model.replace(/(viv[\s-_]|vivo[\s-_]|bbg[\s-_])/i, '');
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  X5F X5L X5M X5iL 都应该是 X5
                if (match = uaData.device.model.match(/([a-z]+[0-9]+)i?[a-z]?[\s-_]?/i)) {
                    uaData.device.model = match[1];
                }
            }
            // handle Oppo
            else if (match = ua.match(/(Oppo[\s-_](\w*)|\s(1100|1105|1107|3000|3005|3007|6607|A100|A103|A105|A105K|A109|A109K|A11|A113|A115|A115K|A121|A125|A127|A129|A201|A203|A209|A31|A31c|A31t|A31u|A51kc|A520|A613|A615|A617|E21W|Find|Mirror|N5110|N5117|N5207|N5209|R2010|R2017|R6007|R7005|R7007|R7c|R7t|R8000|R8007|R801|R805|R807|R809T|R8107|R8109|R811|R811W|R813T|R815T|R815W|R817|R819T|R8200|R8205|R8207|R821T|R823T|R827T|R830|R830S|R831S|R831T|R833T|R850|Real|T703|U2S|U521|U525|U529|U539|U701|U701T|U705T|U705W|X9000|X9007|X903|X905|X9070|X9077|X909|Z101|R829T)[\s\)])/i)) {
                uaData.device.manufacturer = 'Oppo';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  A31c A31s 都应该是 A31
                // 对 Plus 做特殊处理
                if (match = uaData.device.model.match(/([a-z]+[0-9]+)-?(plus)/i)) {
                    uaData.device.model = match[1] + '-' + match[2];
                } else if (match = uaData.device.model.match(/(\w*-?[a-z]+[0-9]+)/i)) {
                    uaData.device.model = match[1];
                }
            } else if (uaData.device.manufacturer && uaData.device.manufacturer.toLowerCase() === 'oppo' && uaData.device.model) {
                // 针对base库的数据做数据格式化处理
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  A31c A31s 都应该是 A31
                // 对 Plus 做特殊处理
                if (match = uaData.device.model.match(/([a-z]+[0-9]+)-?(plus)/i)) {
                    uaData.device.model = match[1] + '-' + match[2];
                } else if (match = uaData.device.model.match(/(\w*-?[a-z]+[0-9]+)/i)) {
                    uaData.device.model = match[1];
                }
            }
                // handle Lenovo
            // 兼容build结尾或直接)结尾 兼容Lenovo-xxx/xxx以及Leveno xxx build等
            else if (match = ua.match(/(Lenovo[\s-_](\w*[-_]?\w*)|\s(A3580|A3860|A5500|A5600|A5860|A7600|A806|A800|A808T|A808T-I|A936|A938t|A788t|K30-E|K30-T|K30-W|K50-T3s|K50-T5|K80M|K910|K910e|K920|S90-e|S90-t|S90-u|S968T|X2-CU|X2-TO|Z90-3|Z90-7)[\s\)])/i)) {
                uaData.device.manufacturer = 'Lenovo';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  A360t A360 都应该是 A360
                if (match = uaData.device.model.match(/([a-z]+[0-9]+)/i)) {
                    uaData.device.model = match[1];
                }
            }
            // handle coolpad
            else if (match = ua.match(/(Coolpad[\s-_](\w*)|\s(7295C|7298A|7620L|8908|8085|8970L|9190L|Y80D)[\s\)])/i)) {
                uaData.device.manufacturer = 'Coolpad';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }

                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  8297-t01 8297-c01 8297w 都应该是 8297
                if (match = uaData.device.model.match(/([a-z]?[0-9]+)/i)) {
                    uaData.device.model = match[1];
                }
            } else if (uaData.device.manufacturer && uaData.device.manufacturer.toLowerCase() === 'coolpad' && uaData.device.model) {
                // base 库适配
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  8297-t01 8297-c01 8297w 都应该是 8297
                if (match = uaData.device.model.match(/([a-z]?[0-9]+)/i)) {
                    uaData.device.model = match[1];
                }
            }
            // handle meizu
            else if (match = ua.match(/\s(mx\d*\w*|mz-(\w*))\s(\w*)\s*\w*\s*build/i)) {
                uaData.device.manufacturer = 'Meizu';
                var tmpModel = match[2] ? match[2] : match[1];
                if (match[3]) {
                    uaData.device.model = tmpModel + '-' + match[3];
                } else {
                    uaData.device.model = tmpModel + '';
                }
            } else if (match = ua.match(/M463C|M35\d/i)) {
                uaData.device.manufacturer = 'Meizu';
                uaData.device.model = match[1];
            }
            // handle htc
            else if (match = ua.match(/(Htc[-_\s](\w*)|\s(601e|606w|608t|609d|610t|6160|619d|620G|626d|626s|626t|626w|709d|801e|802d|802t|802w|809D|816d|816e|816t|816v|816w|826d|826s|826t|826w|828w|901e|919d|A310e|A50AML|A510e|A620d|A620e|A620t|A810e|A9191|Aero|C620d|C620e|C620t|D316d|D516d|D516t|D516w|D820mt|D820mu|D820t|D820ts|D820u|D820us|E9pt|E9pw|E9sw|E9t|HD7S|M8Et|M8Sd|M8St|M8Sw|M8d|M8e|M8s|M8si|M8t|M8w|M9W|M9ew|Phablet|S510b|S510e|S610d|S710d|S710e|S720e|S720t|T327t|T328d|T328t|T328w|T329d|T329t|T329w|T528d|T528t|T528w|T8698|WF5w|X315e|X710e|X715e|X720d|X920e|Z560e|Z710e|Z710t|Z715e)[\s\)])/)) {
                uaData.device.manufacturer = 'Htc';
                uaData.device.model = match[1];
            }
            // handle Gionee
            else if (match = ua.match(/(Gionee[\s-_](\w*)|\s(GN\d+\w*)[\s\)])/i)) {
                uaData.device.manufacturer = 'Gionee';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
            }
            // handle LG
            else if (match = ua.match(/(LG[-_](\w*)|\s(D728|D729|D802|D855|D856|D857|D858|D859|E985T|F100L|F460|H778|H818|H819|P895|VW820)[\s\)])/i)) {
                uaData.device.manufacturer = 'Lg';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
            }
            // handle tcl
            else if (match = ua.match(/(Tcl[\s-_](\w*)|\s(H916T|P588L|P618L|P620M|P728M)[\s\)])/)) {
                uaData.device.manufacturer = 'Tcl';
                uaData.device.model = match[1];
            }
            // ZTE
            else if (match = ua.match(/(V9180|N918)/i)) {
                uaData.device.manufacturer = 'Zte';
                uaData.device.model = match[1];
            } else if (uaData.device.manufacturer && uaData.device.manufacturer.toLowerCase() === 'zte' && uaData.device.model) {
                // base 库适配
                // 解决移动联通等不同发行版导致的机型不同问题
                // 特征：[A-Z][0-9]+[A-Z] 例如  Q505T Q505u 都应该是 Q505
                if (match = uaData.device.model.match(/([a-z]?[0-9]+)/i)) {
                    uaData.device.model = match[1];
                }
            }
            // UIMI
            else if (match = ua.match(/(UIMI\w*|umi\w*)[\s-_](\w*)\s*\w*\s*build/i)) {
                uaData.device.manufacturer = 'Uimi';
                if (match[2]) {
                    uaData.device.model = match[1] + '-' + match[2];
                } else {
                    uaData.device.model = match[1] + '';
                }
            }
            // eton
            else if (match = ua.match(/eton[\s-_](\w*)/i)) {
                uaData.device.manufacturer = 'Eton';
                uaData.device.model = match[1];
            }
            // Smartisan
            else if (match = ua.match(/(SM705|SM701|YQ601|YQ603)/i)) {
                uaData.device.manufacturer = 'Smartisan';
                uaData.device.model = ({
                    SM705: 'T1',
                    SM701: 'T1',
                    YQ601: 'U1',
                    YQ603: 'U1'
                })[match[1]] || match[1];
            }
            // handle Asus
            else if (match = ua.match(/(Asus[\s-_](\w*)|\s(A500CG|A500KL|A501CG|A600CG|PF400CG|PF500KL|T001|X002|X003|ZC500TG|ZE550ML|ZE551ML)[\s\)])/i)) {
                uaData.device.manufacturer = 'Asus';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
            }
            // handle nubia
            else if (match = ua.match(/(Nubia[-_\s](\w*)|(NX501|NX505J|NX506J|NX507J|NX503A|nx\d+\w*)[\s\)])/i)) {
                uaData.device.manufacturer = 'Nubia';
                if (match[2]) {
                    uaData.device.model = match[2];
                } else if (match[3]) {
                    uaData.device.model = match[3];
                }
            }
            // handle haier
            else if (match = ua.match(/(HT-\w*)|Haier[\s-_](\w*-?\w*)/i)) {
                uaData.device.manufacturer = 'Haier';
                if (match[1]) {
                    uaData.device.model = match[1];
                } else if (match[2]) {
                    uaData.device.model = match[2];
                }
            }
            // tianyu
            else if (match = ua.match(/K-Touch[\s-_](tou\s?ch\s?(\d)|\w*)/i)) {
                uaData.device.manufacturer = 'K-Touch';
                if (match[2]) {
                    uaData.device.model = 'Ktouch' + match[2];
                } else {
                    uaData.device.model = match[1];
                }
            }

            // DOOV
            else if (match = ua.match(/Doov[\s-_](\w*)/i)) {
                uaData.device.manufacturer = 'Doov';
                uaData.device.model = match[1];
            }
            // coobee
            else if (/koobee/i.test(ua)) {
                uaData.device.manufacturer = 'koobee';
            }

            // sony
            else if (/C69/i.test(ua)) {
                uaData.device.manufacturer = 'Sony';
            }

            // haojixing
            else if (/N787|N818S/i.test(ua)) {
                uaData.device.manufacturer = 'Haojixing';
            }

            // haisense
            else if (match = ua.match(/(hs-|Hisense[\s-_])(\w*)/i)) {
                uaData.device.manufacturer = 'Hisense';
                uaData.device.model = match[2];
            }

            // format the style of manufacturer
            if (uaData.device.manufacturer) {
                uaData.device.manufacturer = uaData.device.manufacturer.substr(0, 1).toUpperCase() + uaData.device.manufacturer.substr(1).toLowerCase();
            }
            // format the style of model
            if (uaData.device.model) {
                uaData.device.model = uaData.device.model.toUpperCase().replace(/-+|_+|\s+/g, ' ');
                uaData.device.model = uaData.device.model.match(/\s*(\w*\s*\w*)/)[1].replace(/\s+/, '-');

                // 针对三星、华为做去重的特殊处理
                if (uaData.device.manufacturer === 'Samsung') {
                    uaData.device.model = ({
                        'SCH-I95': 'GT-I950',
                        'SCH-I93': 'GT-I930',
                        'SCH-I86': 'GT-I855',
                        'SCH-N71': 'GT-N710',
                        'SCH-I73': 'GT-S789',
                        'SCH-P70': 'GT-I915'
                    })[uaData.device.model] || uaData.device.model;
                } else if (uaData.device.manufacturer === 'Huawei') {
                    uaData.device.model = ({
                        CHE1: 'CHE',
                        CHE2: 'CHE',
                        G620S: 'G621',
                        C8817D: 'G621'
                    })[uaData.device.model] || uaData.device.model;
                }
            }

            // 针对xiaomi 的部分数据没有格式化成功，格式化1次
            if (uaData.device.manufacturer && uaData.device.manufacturer === 'Xiaomi') {
                if (match = uaData.device.model.match(/(hm|mi)-(note)/i)) {
                    uaData.device.model = match[1] + '-' + match[2];
                } else if (match = uaData.device.model.match(/(hm|mi)-(\ds?)/i)) {
                    uaData.device.model = match[1] + '-' + match[2];
                } else if (match = uaData.device.model.match(/(hm|mi)-(\d)[a-rt-z]/i)) {
                    uaData.device.model = match[1] + '-' + match[2];
                }
            }
        }
        // handle browser
        // if (!uaData.browser.name) {
        // ua = ua.toLowerCase();
        if (uaData.device.type === 'desktop') {
            /*
             * 360 security Explorer
             */
            if (match = /360se(?:[ \/]([\w.]+))?/i.exec(ua)) {
                uaData.browser.name = '360 security Explorer';
                uaData.browser.version = {
                    original: match[1]
                };
            }
            /**
             * the world
             */
            else if (match = /the world(?:[ \/]([\w.]+))?/i.exec(ua)) {
                uaData.browser.name = 'the world';
                uaData.browser.version = {
                    original: match[1]
                };
            }
            /**
             * tencenttraveler
             */
            else if (match = /tencenttraveler ([\w.]+)/i.exec(ua)) {
                uaData.browser.name = 'tencenttraveler';
                uaData.browser.version = {
                    original: match[1]
                };
            }
            /**
             * LBBROWSER
             */
            else if (match = /LBBROWSER/i.exec(ua)) {
                uaData.browser.name = 'LBBROWSER';
            }
        } else if (uaData.device.type === 'mobile' || uaData.device.type === 'tablet') {
            /**
             * BaiduHD
             */
            if (match = /BaiduHD\s+([\w.]+)/i.exec(ua)) {
                uaData.browser.name = 'BaiduHD';
                uaData.browser.version = {
                    original: match[1]
                };
            }
            /**
             * 360 Browser
             */
            else if (match = /360.s*aphone\s*browser\s*\(version\s*([\w.]+)\)/i.exec(ua)) {
                uaData.browser.name = '360 Browser';
                uaData.browser.version = {
                    original: match[1]
                };
            }
            /**
             * Baidu Browser
             */
            else if (match = /flyflow\/([\w.]+)/i.exec(ua)) {
                uaData.browser.name = 'Baidu Browser';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * Baidu HD
             */
            else if (match = /baiduhd ([\w.]+)/i.exec(ua)) {
                uaData.browser.name = 'Baidu HD';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * baidubrowser
             */
            else if (match = /baidubrowser\/([\d\.]+)\s/i.exec(ua)) {
                uaData.browser.name = 'baidubrowser';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * LieBaoFast
             */
            else if (match = /LieBaoFast\/([\w.]+)/i.exec(ua)) {
                uaData.browser.name = 'LieBao Fast';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * LieBao
             */
            else if (match = /LieBao\/([\w.]+)/i.exec(ua)) {
                uaData.browser.name = 'LieBao';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * SOUGOU
             */
            else if (match = /Sogou\w+\/([0-9\.]+)/i.exec(ua)) {
                uaData.browser.name = 'SogouMobileBrowser';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * 百度国际
             */
            else if (match = /bdbrowser\w+\/([0-9\.]+)/i.exec(ua)) {
                uaData.browser.name = '百度国际';
                uaData.browser.version = {
                    original: match[1]
                };
            }

            /**
             * Android Chrome Browser
             */
            else if (uaData.os.name === 'Android' && /safari/i.test(ua) && (match = /chrome\/([0-9\.]+)/i.exec(ua))) {
                if (tmpMatch = ua.match(/\s+(\w+Browser)\/?([\d\.]*)/)) {
                    uaData.browser.name = tmpMatch[1];
                    if (tmpMatch[2]) {
                        uaData.browser.version = {original: tmpMatch[2]};
                    } else {
                        uaData.browser.version = {original: match[1]};
                    }
                } else {
                    uaData.browser.name = 'Android Chrome';
                    uaData.browser.version = {original: match[1]};
                }
            }

            /**
             * Android Google Browser
             */
            else if (uaData.os.name === 'Android' && /safari/i.test(ua) && (match = /version\/([0-9\.]+)/i.exec(ua))) {
                if (tmpMatch = ua.match(/\s+(\w+Browser)\/?([\d\.]*)/)) {
                    uaData.browser.name = tmpMatch[1];
                    if (tmpMatch[2]) {
                        uaData.browser.version = {original: tmpMatch[2]};
                    } else {
                        uaData.browser.version = {original: match[1]};
                    }
                } else {
                    uaData.browser.name = 'Android Browser';
                    uaData.browser.version = {original: match[1]};
                }
            }

            /**
             * 'Mozilla/5.0 (iPad; CPU OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B206' belongs to Safari
             */
            else if (/(ipad|iphone).* applewebkit\/.* mobile/i.test(ua)) {
                uaData.browser.name = 'Safari';
            }
        }
        if (match = ua.match(/baiduboxapp\/?([\d\.]*)/i)) {
            uaData.browser.name = '百度框';
            if (match[1]) {
                uaData.browser.version = {
                    original: match[1]
                };
            }
            // uaData.browser.name = 'baidu box';
        } else if (/BaiduLightAppRuntime/i.test(ua)) {
            uaData.browser.name = '轻应用runtime';
            // uaData.browser.name = 'qing runtime';
        } else if (/Weibo/i.test(ua)) {
            uaData.browser.name = '微博';
            // uaData.browser.name = 'weibo';
        } else if (/MQQ/i.test(ua)) {
            uaData.browser.name = '手机QQ';
            // uaData.browser.name = 'mobile qq';
        } else if (/hao123/i.test(ua)) {
            uaData.browser.name = 'hao123';
        }
        // }
        if (match = /MicroMessenger\/([\w.]+)/i.exec(ua)) {
            uaData.browser.name = '微信';
            var tmpVersion = (match[1]).replace(/_/g, '.');
            tmpMatch = /(\d+\.\d+\.\d+\.\d+)/.exec(tmpVersion);
            if (tmpMatch) {
                tmpVersion = tmpMatch[1];
            }
            uaData.browser.version = {
                original: tmpVersion
            };
        }
        if (match = /UCBrowser\/([\w.]+)/i.exec(ua)) {
            uaData.browser.name = 'UC Browser';
            uaData.browser.version = {
                original: match[1]
            };
        }
        if (match = /OPR\/([\w.]+)/i.exec(ua)) {
            uaData.browser.name = 'Opera';
            uaData.browser.version = {
                original: match[1]
            };
        } else if (match = /OPiOS\/([\w.]+)/i.exec(ua)) {
            uaData.browser.name = 'Opera';
            uaData.browser.version = {
                original: match[1]
            };
        }
        // IE 11
        else if (/Trident\/7/i.test(ua) && /rv:11/i.test(ua)) {
            uaData.browser.name = 'Internet Explorer';
            uaData.browser.version = {
                major: '11',
                original: '11'
            };
        }
        // Microsoft Edge
        else if (/Edge\/12/i.test(ua) && /Windows Phone|Windows NT/i.test(ua)) {
            uaData.browser.name = 'Microsoft Edge';
            uaData.browser.version = {
                major: '12',
                original: '12'
            };
        }
        // miui browser
        else if (match = /miuibrowser\/([\w.]+)/i.exec(ua)) {
            uaData.browser.name = 'miui browser';
            uaData.browser.version = {
                original: match[1]
            };
        }
        // Safari
        if (!uaData.browser.name) {
            if (match = /Safari\/([\w.]+)/i.exec(ua) && /Version/i.test(ua)) {
                uaData.browser.name = 'Safari';
            }
        }
        if (uaData.browser.name && !uaData.browser.version) {
            if (match = /Version\/([\w.]+)/i.exec(ua)) {
                uaData.browser.version = {
                    original: match[1]
                };
            }
        }

        // if (uaData.os.name === 'Windows' && uaData.os.version) {
        //  // Windows 8.1
        //  if (uaData.os.version.alias === 'NT 6.3') {
        //      uaData.os.version.alias = '8.1';
        //  }
        // }
        // handle os
        if (uaData.os.name === 'Windows' || /Windows/i.test(ua)) {
            uaData.os.name = 'Windows';
            if (/NT 6.3/i.test(ua)) {
                uaData.os.version = {
                    alias: '8.1',
                    original: '8.1'
                };
            } else if (/NT 6.4/i.test(ua) || /NT 10.0/i.test(ua)) {
                uaData.os.version = {
                    alias: '10',
                    original: '10'
                };
            }
        } else if (uaData.os.name === 'Mac OS X') {
            uaData.os.name = 'Mac OS X';
            if (match = /Mac OS X[\s\_\-\/](\d+[\.\-\_]\d+[\.\-\_]?\d*)/i.exec(ua)) {
                uaData.os.version = {
                    alias: match[1].replace(/_/g, '.'),
                    original: match[1].replace(/_/g, '.')
                };
            } else {
                uaData.os.version = {
                    alias: '',
                    original: ''
                };
            }
        } else if (/Android/i.test(uaData.os.name)) {
            if (match = ua.match(/Android[\s\_\-\/i686]?[\s\_\-\/](\d+[\.\-\_]\d+[\.\-\_]?\d*)/i)) {
                uaData.os.version = {
                    alias: match[1],
                    original: match[1]
                };
            }
        }
        return uaData;
    }
    //-------------设备型号等信息--------------

    //获取设备品牌型号等信息
    var ua = window.navigator.userAgent;
    var DEVICEINFO = new userAgent(ua);

    var utf8Encode = function utf8Encode(string) {
        string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        var utftext = '',
            start,
            end;
        var stringl = 0,
            n;

        start = end = 0;
        stringl = string.length;

        for (n = 0; n < stringl; n++) {
            var c1 = string.charCodeAt(n);
            var enc = null;

            if (c1 < 128) {
                end++;
            } else if (c1 > 127 && c1 < 2048) {
                enc = String.fromCharCode(c1 >> 6 | 192, c1 & 63 | 128);
            } else {
                enc = String.fromCharCode(c1 >> 12 | 224, c1 >> 6 & 63 | 128, c1 & 63 | 128);
            }
            if (enc !== null) {
                if (end > start) {
                    utftext += string.substring(start, end);
                }
                utftext += enc;
                start = end = n + 1;
            }
        }

        if (end > start) {
            utftext += string.substring(start, string.length);
        }

        return utftext;
    };

    var base64Encode = function base64Encode(data) {
        var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var o1,
            o2,
            o3,
            h1,
            h2,
            h3,
            h4,
            bits,
            i = 0,
            ac = 0,
            enc = '',
            tmp_arr = [];

        if (!data) {
            return data;
        }

        data = utf8Encode(data);

        do {
            // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            // use hexets to index into b64, and append result to encoded string
            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        switch (data.length % 3) {
            case 1:
                enc = enc.slice(0, -2) + '==';
                break;
            case 2:
                enc = enc.slice(0, -1) + '=';
                break;
        }

        return enc;
    };

    // 兼容单元测试环境
    var win = void 0;
    if (typeof window === 'undefined') {
        win = {
            navigator: {
                userAgent: ''
            },
            location: {
                pathname: '',
                href: ''
            },
            document: {},
            screen: {
                width: '',
                height: ''
            }
        };
    } else {
        win = window;
    }

    function toString(object) {
        return Object.prototype.toString.call(object);
    }

    function isObject(object) {
        return toString(object) === "[object Object]";
    }

    function isFunction(object) {
        return toString(object) === "[object Function]";
    }

    function each(object, factory) {
        for (var i = 0, l = object.length; i < l; i++) {
            if (factory.call(object, object[i], i) === false) {
                break;
            }
        }
    }

    // 兼容单元测试环境
    var win$1 = void 0;
    if (typeof window === 'undefined') {
        win$1 = {
            navigator: {
                userAgent: ''
            },
            location: {
                pathname: '',
                href: ''
            },
            document: {
                URL: ''
            },
            screen: {
                width: '',
                height: ''
            }
        };
    } else {
        win$1 = window;
    }

    var breaker = {};

    var _ = {
        each: function each(obj, iterator, context) {
            if (obj === null || obj === undefined) {
                return;
            }
            if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                        return;
                    }
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty.call(obj, key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) {
                            return;
                        }
                    }
                }
            }
        },
        extend: function extend(obj) {
            _.each(Array.prototype.slice.call(arguments, 1), function (source) {
                for (var prop in source) {
                    if (source[prop] !== void 0) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        },
        isObject: function isObject(obj) {
            return obj === Object(obj) && !_.isArray(obj);
        },
        isUndefined: function isUndefined(obj) {
            return obj === void 0;
        },
        isArguments: function isArguments(obj) {
            return !!(obj && hasOwnProperty.call(obj, 'callee'));
        },
        toArray: function toArray(iterable) {
            if (!iterable) {
                return [];
            }
            if (iterable.toArray) {
                return iterable.toArray();
            }
            if (_.isArray(iterable)) {
                return Array.prototype.slice.call(iterable);
            }
            if (_.isArguments(iterable)) {
                return Array.prototype.slice.call(iterable);
            }
            return _.values(iterable);
        },
        values: function values(obj) {
            var results = [];
            if (obj === null) {
                return results;
            }
            _.each(obj, function (value) {
                results[results.length] = value;
            });
            return results;
        },

        // 转化成json
        JSONDecode: function JSONDecode(string) {
            try {
                return JSON.parse(string);
            } catch (error) {
                return {};
            }
        },

        // json转化为string
        JSONEncode: function JSONEncode(json) {
            try {
                return JSON.stringify(json);
            } catch (error) {
                return '';
            }
        },

        // 判断类型是否为function
        isFunction: function isFunction(fn) {
            var bool = false;
            if (typeof fn === 'function') {
                bool = true;
            }
            return bool;
        },
        base64Encode: function base64Encode$$1(str) {
            return base64Encode(str);
        },
        sha1: function sha1$$1(str) {
            return '';
        },

        // 对象的字段值截取
        truncate: function truncate(obj, length) {
            var ret = void 0;
            if (typeof obj === 'string') {
                ret = obj.slice(0, length);
            } else if (_.isArray(obj)) {
                ret = [];
                _.each(obj, function (val) {
                    ret.push(_.truncate(val, length));
                });
            } else if (_.isObject(obj)) {
                ret = {};
                _.each(obj, function (val, key) {
                    ret[key] = _.truncate(val, length);
                });
            } else {
                ret = obj;
            }
            return ret;
        },
        isNumber: function isNumber(obj) {
            return Object.prototype.toString.call(obj) == '[object Number]';
        },
        isString: function isString(str) {
            return Object.prototype.toString.call(str) == '[object String]';
        },
        HTTPBuildQuery: function HTTPBuildQuery(formdata, arg_separator) {
            var use_val = void 0,
                use_key = void 0,
                tmp_arr = [];

            if (_.isUndefined(arg_separator)) {
                arg_separator = '&';
            }

            _.each(formdata, function (val, key) {
                use_val = encodeURIComponent(val.toString());
                use_key = encodeURIComponent(key);
                tmp_arr[tmp_arr.length] = use_key + '=' + use_val;
            });

            return tmp_arr.join(arg_separator);
        },

        // 删除左右两端的空格
        trim: function trim(str) {
            if (!str) return;
            return str.replace(/(^\s*)|(\s*$)/g, "");
        },

        // 验证yyyy-MM-dd日期格式
        checkTime: function checkTime(timeString) {
            var reg = /^(\d{4})-(\d{2})-(\d{2})$/;
            if (timeString) {
                if (!reg.test(timeString)) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        },

        // 返回指定url的域名
        // 若不传入url，返回当前网页的域名
        getHost: function getHost(url) {
            var host = '';
            if (!url) {
                url = document.URL;
            }
            var regex = /.*\:\/\/([^\/]*).*/;
            var match = url.match(regex);
            if (match) {
                host = match[1];
            }
            return host;
        },

        // 获取url上指定参数的值
        getQueryParam: function getQueryParam(url, param) {
            var target = param.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
            var regexS = '[\\?&]' + target + '=([^&#]*)';
            var regex = new RegExp(regexS);
            var results = regex.exec(url);
            if (results === null || results && typeof results[1] !== 'string' && results[1].length) {
                return '';
            } else {
                return decodeURIComponent(results[1]).replace(/\+/g, ' ');
            }
        },

        // 删除对象中空字段
        deleteEmptyProperty: function deleteEmptyProperty(obj) {
            if (!this.isObject(obj)) {
                return;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] === null || this.isUndefined(obj[key]) || obj[key] === "") {
                        delete obj[key];
                    }
                }
            }
            return obj;
        }
    };
    _.isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    };

    _.loadScript = function (para) {
        para = _.extend({
            success: function success() {
            },
            error: function error() {
            },
            appendCall: function appendCall(g) {
                document.getElementsByTagName('head')[0].appendChild(g);
            }
        }, para);

        var g = null;
        if (para.type === 'css') {
            g = document.createElement('link');
            g.rel = 'stylesheet';
            g.href = para.url;
        }
        if (para.type === 'js') {
            g = document.createElement('script');
            g.async = 'async';
            g.setAttribute('charset', 'UTF-8');
            g.src = para.url;
            g.type = 'text/javascript';
        }
        g.onload = g.onreadystatechange = function () {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                para.success();
                g.onload = g.onreadystatechange = null;
            }
        };
        g.onerror = function () {
            para.error();
            g.onerror = null;
        };
        // if iframe
        para.appendCall(g);
    };

    _.register_event = function () {
        // written by Dean Edwards, 2005
        // with input from Tino Zijdel - crisp@xs4all.nl
        // with input from Carl Sverre - mail@carlsverre.com
        // with input from DATracker
        // http://dean.edwards.name/weblog/2005/10/add-event/
        // https://gist.github.com/1930440

        /**
         * @param {Object} element
         * @param {string} type
         * @param {function(...[*])} handler
         * @param {boolean=} oldSchool
         * @param {boolean=} useCapture
         */
        var register_event = function register_event(element, type, handler, oldSchool, useCapture) {
            if (!element) {
                console.error('No valid element provided to register_event');
                return;
            }

            if (element.addEventListener && !oldSchool) {
                element.addEventListener(type, handler, !!useCapture);
            } else {
                var ontype = 'on' + type;
                var old_handler = element[ontype]; // can be undefined
                element[ontype] = makeHandler(element, handler, old_handler);
            }
        };

        function makeHandler(element, new_handler, old_handlers) {
            var handler = function handler(event) {
                event = event || fixEvent(window.event);

                // this basically happens in firefox whenever another script
                // overwrites the onload callback and doesn't pass the event
                // object to previously defined callbacks.  All the browsers
                // that don't define window.event implement addEventListener
                // so the dom_loaded handler will still be fired as usual.
                if (!event) {
                    return undefined;
                }

                var ret = true;
                var old_result, new_result;

                if (_.isFunction(old_handlers)) {
                    old_result = old_handlers(event);
                }
                new_result = new_handler.call(element, event);

                if (false === old_result || false === new_result) {
                    ret = false;
                }

                return ret;
            };

            return handler;
        }

        function fixEvent(event) {
            if (event) {
                event.preventDefault = fixEvent.preventDefault;
                event.stopPropagation = fixEvent.stopPropagation;
            }
            return event;
        }

        fixEvent.preventDefault = function () {
            this.returnValue = false;
        };
        fixEvent.stopPropagation = function () {
            this.cancelBubble = true;
        };

        return register_event;
    }();

    _.register_hash_event = function (callback) {
        _.register_event(window, 'hashchange', callback);
    };

    // 客户端基本属性
    _.info = {
        domain: function domain(referrer) {
            var split = referrer.split('/');
            if (split.length >= 3) {
                return split[2];
            }
            return '';
        },

        properties: function properties() {
            var browserVer = '';
            //兼容sougou浏览器，DEVICEINFO.browser无original字段问题
            if (DEVICEINFO.browser.version != null) {
                browserVer = DEVICEINFO.browser.version.original;
            }

            return {
                // 设备型号
                deviceBrand: DEVICEINFO.device.manufacturer,
                deviceModel: DEVICEINFO.device.model,
                // 操作系统
                osType: DEVICEINFO.os.name,
                // 操作系统版本
                osVer: DEVICEINFO.os.version.original,
                // 设备平台
                devicePlatform: DEVICEINFO.device.type,
                // 浏览器名称
                browser: DEVICEINFO.browser.name,
                // 浏览器版本
                browserVer: browserVer,
                // 页面标题
                title: win$1.document.title || '',
                // 页面路径
                urlPath: win$1.location.pathname || '',
                // 页面url
                pageURL: document.URL,
                // 域名
                domain: this.domain(document.URL),
                // referrer 数据来源
                prePageURL: win$1.document.referrer,
                // referrer 域名
                prePageDomain: this.domain(win$1.document.referrer),
                // 本地语言
                deviceLanguage: (win$1.navigator.language || win$1.navigator.browserLanguage).toLowerCase() || '',
                // 客户端分辨率 width
                screenWidth: win$1.screen.width,
                // 客户端分辨率 height
                screenHeight: win$1.screen.height,
                resolution: win$1.screen.width + '*' + win$1.screen.height,
            };
        }
    };

    // 消息订阅/推送
    _.innerEvent = {
        /**
         * 订阅
         *  */
        on: function on(key, fn) {
            if (!this._list) {
                this._list = {};
            }
            if (!this._list[key]) {
                this._list[key] = [];
            }
            this._list[key].push(fn);
        },
        off: function off(key) {
            if (!this._list) {
                this._list = {};
            }
            if (!this._list[key]) {
                return;
            } else {
                delete this._list[key];
            }
        },
        /**
         * 推送
         */
        trigger: function trigger() {
            var args = Array.prototype.slice.call(arguments);
            var key = args[0];
            var arrFn = this._list && this._list[key];
            if (!arrFn || arrFn.length === 0) {
                return;
            }
            for (var i = 0; i < arrFn.length; i++) {
                if (typeof arrFn[i] == 'function') {
                    arrFn[i].apply(this, args);
                }
            }
        }
    };

    // 发送数据
    _.sendRequest = function (url, type, data, callback) {
        data['_'] = new Date().getTime().toString();
        if (type === 'img') {
            url += '?' + _.HTTPBuildQuery(data);
            var img = document.createElement('img');
            img.src = url;
            img.width = 1;
            img.height = 1;
            if (_.isFunction(callback)) {
                callback(0);
            }
            img.onload = function () {
                this.onload = null;
            };
            img.onerror = function () {
                this.onerror = null;
            };
            img.onabort = function () {
                this.onabort = null;
            };
        } else if (type === 'get') {
            url += '?' + _.HTTPBuildQuery(data);
            _.ajax.get(url, callback);
        } else if (type === 'post') {
            _.ajax.get(url, data, callback);
        }
    };

    _.ajax = {
        post: function post(url, options, callback, timeout) {
            var that = this;
            that.callback = callback || function (params) {
            };
            try {
                var req = new XMLHttpRequest();
                req.open('POST', url, true);
                req.setRequestHeader("Content-type", "application/json");
                req.withCredentials = true;
                req.ontimeout = function () {
                    that.callback({status: 0, error: true, message: 'request ' + url + ' time out'});
                };
                req.onreadystatechange = function () {
                    if (req.readyState === 4) {
                        if (req.status === 200) {
                            that.callback(_.JSONDecode(req.responseText));
                        } else {
                            var message = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                            that.callback({status: 0, error: true, message: message});
                        }
                    }
                };
                req.timeout = timeout || 5000;
                req.send(_.JSONEncode(options));
            } catch (e) {
            }
        },
        get: function get(url, callback) {
            try {
                var req = new XMLHttpRequest();
                req.open('GET', url, true);
                req.withCredentials = true;
                req.onreadystatechange = function () {
                    if (req.readyState === 4) {
                        if (req.status === 200) {
                            if (callback) {
                                callback(req.responseText);
                            }
                        } else {
                            if (callback) {
                                var message = 'Bad HTTP status: ' + req.status + ' ' + req.statusText;
                                callback({status: 0, error: true, message: message});
                            }
                        }
                    }
                };
                req.send(null);
            } catch (e) {
            }
        }
    };

    // uuid
    _.UUID = function () {
        var T = function T() {
            var d = 1 * new Date(),
                i = 0;
            while (d == 1 * new Date()) {
                i++;
            }
            return d.toString(16) + i.toString(16);
        };
        var R = function R() {
            return Math.random().toString(16).replace('.', '');
        };
        var UA = function UA(n) {
            var ua = navigator.userAgent,
                i,
                ch,
                buffer = [],
                ret = 0;

            function xor(result, byte_array) {
                var j,
                    tmp = 0;
                for (j = 0; j < byte_array.length; j++) {
                    tmp |= buffer[j] << j * 8;
                }
                return result ^ tmp;
            }

            for (i = 0; i < ua.length; i++) {
                ch = ua.charCodeAt(i);
                buffer.unshift(ch & 0xFF);
                if (buffer.length >= 4) {
                    ret = xor(ret, buffer);
                    buffer = [];
                }
            }

            if (buffer.length > 0) {
                ret = xor(ret, buffer);
            }

            return ret.toString(16);
        };

        return function () {
            // 有些浏览器取个屏幕宽度都异常...
            var se = String(screen.height * screen.width);
            if (se && /\d{5,}/.test(se)) {
                se = se.toString(16);
            } else {
                se = String(Math.random() * 31242).replace('.', '').slice(0, 8);
            }
            var val = T() + '-' + R() + '-' + UA() + '-' + se + '-' + T();
            if (val) {
                return val;
            } else {
                return (String(Math.random()) + String(Math.random()) + String(Math.random())).slice(2, 15);
            }
        };
    }();

    // 存储方法封装 localStorage  cookie
    _.localStorage = {
        error: function error(msg) {
            console.error('localStorage error: ' + msg);
        },

        get: function get(name) {
            try {
                return window.localStorage.getItem(name);
            } catch (err) {
                _.localStorage.error(err);
            }
            return null;
        },

        parse: function parse(name) {
            try {
                return _.JSONDecode(_.localStorage.get(name)) || {};
            } catch (err) {
                // noop
            }
            return null;
        },

        set: function set(name, value) {
            try {
                window.localStorage.setItem(name, value);
            } catch (err) {
                _.localStorage.error(err);
            }
        },

        remove: function remove(name) {
            try {
                window.localStorage.removeItem(name);
            } catch (err) {
                _.localStorage.error(err);
            }
        }
    };
    _.cookie = {
        get: function get(name) {
            var nameEQ = name + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        },

        parse: function parse(name) {
            var cookie;
            try {
                cookie = _.JSONDecode(_.cookie.get(name)) || {};
            } catch (err) {
                // noop
            }
            return cookie;
        },

        set_seconds: function set_seconds(name, value, seconds, cross_subdomain, is_secure) {
            var cdomain = '',
                expires = '',
                secure = '';

            if (cross_subdomain) {
                var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                    domain = matches ? matches[0] : '';

                cdomain = domain ? '; domain=.' + domain : '';
            }

            if (seconds) {
                var date = new Date();
                date.setTime(date.getTime() + seconds * 1000);
                expires = '; expires=' + date.toGMTString();
            }

            if (is_secure) {
                secure = '; secure';
            }

            document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
        },

        set: function set(name, value, days, cross_subdomain, is_secure) {
            var cdomain = '',
                expires = '',
                secure = '';

            if (cross_subdomain) {
                var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                    domain = matches ? matches[0] : '';

                cdomain = domain ? '; domain=.' + domain : '';
            }

            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                expires = '; expires=' + date.toGMTString();
            }

            if (is_secure) {
                secure = '; secure';
            }

            var new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
            document.cookie = new_cookie_val;
            return new_cookie_val;
        },

        remove: function remove(name, cross_subdomain) {
            _.cookie.set(name, '', -1, cross_subdomain);
        }
    };


    var windowConsole = win$1.console;
    var console = {
        /** @type {function(...[*])} */
        log: function log() {
            if (SYSTEM_CONFIG.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
                try {
                    windowConsole.log.apply(windowConsole, arguments);
                } catch (err) {
                    _.each(arguments, function (arg) {
                        windowConsole.log(arg);
                    });
                }
            }
        },
        /** @type {function(...[*])} */
        error: function error() {
            if (SYSTEM_CONFIG.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
                var args = ['DATracker error:'].concat(_.toArray(arguments));
                try {
                    windowConsole.error.apply(windowConsole, args);
                } catch (err) {
                    _.each(args, function (arg) {
                        windowConsole.error(arg);
                    });
                }
            }
        }
    };

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var USER_TRACK = function () {
        function USER_TRACK(instance) {
            _classCallCheck(this, USER_TRACK);

            this.instance = instance;
            this['local_storage'] = this.instance['local_storage'];
        }

        /**
         * 检测设置的属性是否为系统保留属性
         * @param {String} prop
         */


        _createClass(USER_TRACK, [{
            key: '_is_reserved_property',
            value: function _is_reserved_property(prop) {
                return PEOPLE_RESERVED_PROPERTY.indexOf('prop') > -1;
            }
            /**
             * 上报用户属性数据
             * @param {Object} properties
             * @param {Function} callback
             */

        }, {
            key: '_send_request',
            value: function _send_request(properties, callback) {
                if (!_.isFunction(callback)) {
                    callback = function callback() {
                    };
                }

                properties = properties || {};

                var data = {
                    dataType: SYSTEM_EVENT_TYPE,
                    // 客户端唯一凭证(设备凭证)
                    deviceID: this.instance.get_device_id(),
                    userId: this.instance.get_property('user_id'),
                    // 上报时间
                    reportTime: new Date().getTime(),
                    // 终端类型 （js，小程序、安卓、IOS、server、pc）
                    terminalType: PRODUCT_CONFIG.TERMINAL_TYPE,
                    // 属性事件id
                    peopleID: PEOPLE_PROPERTY_ID,
                    // 用户首次访问时间
                    persistedTime: this.instance.get_property('persistedTime'),
                    // 页面打开场景, 默认 Browser
                    pageOpenScene: 'Browser',
                    // 自定义用户属性
                    'var': properties
                };

                // 合并渠道推广信息
                data = _.extend({}, data, this.instance['channel'].get_channel_params());

                // 上报数据对象字段截取
                var truncateLength = this.instance._get_config('truncateLength');
                var truncated_data = data;
                if (_.isNumber(truncateLength) && truncateLength > 0) {
                    truncated_data = _.truncate(data, truncateLength);
                }

                console.log('上报的数据（截取后）:', truncated_data);

                var callback_fn = function callback_fn(response) {
                    callback(response, data);
                };
                var url = this.instance._get_config('track_url');

                // 数据上报方式
                var track_type = this.instance._get_config('track_type');
                if (track_type === 'img') {
                    url += 'track.gif';
                }
                _.sendRequest(url, track_type, {
                    data: _.base64Encode(_.JSONEncode(truncated_data)),
                    token: this.instance._get_config('token')
                }, callback_fn);
            }
            /**
             * 设置用户属性
             * @param {*} prop
             * @param {*} to
             * @param {*} callback
             */

        }, {
            key: 'set',
            value: function set(prop, to, callback) {
                var _this = this;

                var set_props = {};
                if (_.isObject(prop)) {
                    _.each(prop, function (v, k) {
                        // 不是系统保留属性
                        if (!_this._is_reserved_property(k)) {
                            set_props[k] = v;
                        }
                    });
                    callback = to;
                } else {
                    set_props[prop] = to;
                }
                return this._send_request(set_props, callback);
            }
        }]);

        return USER_TRACK;
    }();

    var _createClass$1 = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck$1(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var EVENT_TRACK = function () {
        function EVENT_TRACK(instance) {
            var _this = this;

            _classCallCheck$1(this, EVENT_TRACK);

            this.instance = instance;
            this['local_storage'] = this.instance['local_storage'];
            // 初始化时间(事件相关)
            this['local_storage'].register_once({
                updatedTime: 0,
                sessionStartTime: 0
            });
            // 将当前的referrer保存到本地缓存
            this['local_storage'].register({
                sessionReferrer: document.referrer
            });

            var mark_page_url = document.URL;
            // 单页面触发PV事件时，设置 referrer
            _.innerEvent.on('singlePage:change', function (eventName, urlParams) {
                _this['local_storage'].register({
                    sessionReferrer: mark_page_url
                });
                mark_page_url = document.URL;
            });
        }

        /**
         *
         * 判断是否为其它渠道
         */


        _createClass$1(EVENT_TRACK, [{
            key: '_check_channel',
            value: function _check_channel() {
                var referrer = this.instance.get_property('sessionReferrer');
                var is_other_channel = false;
                // 若本地缓存的referrer 的host跟当前页不一样，那么可以确定是其它渠道进来的
                if (_.getHost(referrer) !== window.location.host) {
                    is_other_channel = true;
                }
                return is_other_channel;
            }
            /**
             * TODO
             * 判断指定事件是否被禁止上报
             * @param {String} event_name
             * @returns {Boolean}
             */

        }, {
            key: '_event_is_disabled',
            value: function _event_is_disabled(event_name) {
                return false;
            }
            /**
             * 打开新会话
             */

        }, {
            key: '_start_new_session',
            value: function _start_new_session() {
                this['local_storage'].register({
                    sessionID: _.UUID(),
                    sessionStartTime: new Date().getTime()
                });
                this.track(SYSTEM_EVENT_OBJECT.sessionStart.event_id, SYSTEM_EVENT_OBJECT.sessionStart.event_name, SYSTEM_EVENT_OBJECT.sessionStart.event_type);
            }
            /**
             * TODO
             * 关闭当前会话
             */

        }, {
            key: '_close_cur_session',
            value: function _close_cur_session() {
                /*
                 为了便于绘制用户事件发生轨迹图，区分会话close和最后一次事件触发时间的顺序，会话关闭时间需要做些微调
                 1. 如果本地拿到了上次（非会话事件）事件的触发时间，time = this.instance.get_property('LASTEVENT').time + 1;
                 2. 如果未拿到，time = new Date().getTime() - 1;
                */
                var time = new Date().getTime() - 1;
                var sessionStartTime = this.instance.get_property('sessionStartTime');
                var LASTEVENT = this.instance.get_property('LASTEVENT');
                if (LASTEVENT && LASTEVENT.time) {
                    time = LASTEVENT.time + 1;
                }
                var sessionTotalLength = time - sessionStartTime;
                if (sessionTotalLength >= 0) {
                    this.track(SYSTEM_EVENT_OBJECT.sessionClose.event_id, SYSTEM_EVENT_OBJECT.sessionClose.event_name, SYSTEM_EVENT_OBJECT.sessionClose.event_type, {
                        sessionCloseTime: time,
                        sessionTotalLength: sessionTotalLength
                    });
                }
            }
            /**
             * 判断会话重新开启
             * 判断条件：会话首次开始、指定的一段时间内用户无事件操作、其它渠道进来
             */

        }, {
            key: '_session',
            value: function _session(callback) {
                var session_start_time = 1 * this.instance.get_property('sessionStartTime') / 1000;
                var updated_time = 1 * this.instance.get_property('updatedTime') / 1000;
                var now_date_time_ms = new Date().getTime();
                var now_date_time_se = now_date_time_ms / 1000;
                // 其它渠道判断
                var other_channel_Bool = this._check_channel();
                //会话结束判断
                if (session_start_time === 0 || now_date_time_se > updated_time + 60 * this.instance._get_config('session_interval_mins') || other_channel_Bool) {
                    // 当会话首次开始时，不用发送会话关闭事件
                    if (session_start_time === 0) {
                        // 新打开一个会话
                        this._start_new_session();
                    } else {
                        this._close_cur_session();
                        this._start_new_session();
                    }
                }
                // 更新本地的最后事件操作时间
                this['local_storage'].register({
                    updatedTime: now_date_time_ms
                });
                // 执行回调方法
                if (_.isFunction(callback)) {
                    callback();
                }
            }
            /**
             * 用户注册
             * @param {String} user_id
             */

        }, {
            key: '_signup',
            value: function _signup(user_id) {
                // 默认是空值,若有值则调用退出
                var anonymous_id = this.instance.get_property('userId');
                if (anonymous_id !== user_id) {
                    if (anonymous_id) {
                        this.logout();
                    }
                    this.track(SYSTEM_EVENT_OBJECT.signup.event_id, SYSTEM_EVENT_OBJECT.signup.event_name, SYSTEM_EVENT_OBJECT.signup.event_type, {
                        anonymousId: anonymous_id,
                        newUserId: user_id
                    });
                }
            }
            /**
             * 设置一个指定事件的耗时监听器
             * @param {String} event_name
             */

        }, {
            key: 'time_event',
            value: function time_event(event_name) {
                if (_.isUndefined(event_name)) {
                    console.error('事件耗时监听器需要一个事件名称');
                    return;
                }
                // 被禁止的事件，无需监听
                if (this._event_is_disabled(event_name)) {
                    return;
                }
                this['local_storage'].set_event_timer(event_name, new Date().getTime());
            }
            /**
             * 发送PV事件，在此之前检测session
             * @param {Object} properties  pv属性
             * @param {*} callback
             */

        }, {
            key: 'track_pv',
            value: function track_pv(properties, callback) {
                var _this2 = this;

                this._session(function () {
                    _this2.track(SYSTEM_EVENT_OBJECT.normalPageView.event_id, SYSTEM_EVENT_OBJECT.normalPageView.event_name, SYSTEM_EVENT_OBJECT.normalPageView.event_type, _.extend({}, properties), callback);
                });
            }
            /**
             * 追踪事件（上报用户事件触发数据）
             * @param {String} event_name 事件名称（必须）
             * @param {Object} properties 事件属性
             * @param {Function} callback 上报后的回调方法
             * @param {String} event_type 自定义事件类型
             * @returns {Object} track_data 上报的数据
             */

        }, {
            key: 'track',
            value: function track(event_id, event_name, event_type, properties, callback) {

                // 当触发的事件不是这些事件(sessionStart,sessionClose)时，触发检测 session 方法
                if (['sessionStart', 'sessionClose'].indexOf(event_name) === -1) {
                    this._session();
                }

                if (_.isUndefined(event_id)) {
                    console.error('上报数据需要一个事件ID');
                    return;
                }
                if (_.isUndefined(event_name)) {
                    console.error('上报数据需要一个事件名称');
                    return;
                }
                if (_.isUndefined(event_type)) {
                    console.error('上报数据需要一个事件类型');
                    return;
                }
                if (event_type !== 'page' && event_type !== 'click' && event_type !== 'view') {
                    console.error('事件类型必须为page、click或者view');
                    return;
                }
                if (!_.isFunction(callback)) {
                    callback = function callback() {
                    };
                }
                if (this._event_is_disabled(event_id)) {
                    callback(0);
                    return;
                }
                // 重新在本地取数据读取到缓存
                this['local_storage'].load();
                // 事件属性
                properties = properties || {};
                // 标记：传入的属性另存一份
                var user_set_properties = _.JSONDecode(_.JSONEncode(properties)) || {};
                var costTime = void 0;
                // 移除该事件的耗时监听器，获取设置监听器的时间戳，计算耗时
                var start_listen_timestamp = this['local_storage'].remove_event_timer(event_name);
                if (!_.isUndefined(start_listen_timestamp)) {
                    costTime = new Date().getTime() - start_listen_timestamp;
                }
                // 事件类型设置
                var data_type = BUSSINESS_EVENT_TYPE;
                // 事件类型设置为传入了自定义事件类型
                if (event_type) {
                    data_type = event_type;
                } else
                    // 如果是内置事件,事件类型重新设置
                if (SYSTEM_EVENT_OBJECT[event_name]) {
                    data_type = SYSTEM_EVENT_OBJECT[event_name].data_type;
                }

                // 事件触发时间
                var time = new Date().getTime();
                // 会话有时间差
                // 触发的事件若是会话结束，触发时间要重新设置
                // 若事件id为会话关闭，需要删除传入的自定义属性
                if (event_name === 'sessionClose') {
                    time = properties.sessionCloseTime;
                    delete user_set_properties['sessionCloseTime'];
                    delete user_set_properties['sessionTotalLength'];
                }

                // 设置通用的事件属性
                user_set_properties = _.extend({}, this.instance.get_property('superProperties'), user_set_properties);

                // 上报数据
                var data = {
                    trackId: Number(String(Math.random()).slice(2, 8) + String(Math.random()).slice(2, 6) + String((new Date()).getTime()).slice(-4)),
                    eventType: event_type,
                    eventID: event_id,
                    // 事件名称
                    eventName: event_name,
                    // 事件触发时间
                    eventTime: time,
                    // 事件上报时间
                    // reportTime: time,

                    // sdk类型 （js，小程序、安卓、IOS、server、pc）
                    terminalType: '0',
                    sdkVersion: SDK_CONFIG.SDK_VERSION,

                    ip: '' + this.instance.get_property('ip') + '',

                    loginStatus: this.instance.get_property('loginStatus'),
                    visitID: this.instance.get_property('visitID'),
                    userId: this.instance.get_property('userId'),

                    // 当前会话id
                    sessionID: this.instance.get_property('sessionID'),

                    //产品信息
                    productName: PRODUCT_CONFIG.PRODUCT_NAME,
                    productCode: PRODUCT_CONFIG.PRODUCT_CODE,
                    productVer: PRODUCT_CONFIG.PRODUCT_VER,
                    siteType: PRODUCT_CONFIG.SITE_TYPE,
                    appChannel: PRODUCT_CONFIG.APP_CHANNEL,

                    // 用户首次访问时间
                    persistedTime: this.instance.get_property('persistedTime'),

                    // 客户端唯一凭证(设备凭证)
                    deviceID: this.instance.get_device_id(),
                    deviceBrand: '',

                    // dataType: data_type,
                    // 页面打开场景, 默认 Browser
                    pageOpenScene: 'Browser',
                    // 应用凭证
                    token: this.instance._get_config('token'),
                    costTime: costTime,
                    // 当前关闭的会话时长
                    sessionTotalLength: properties.sessionTotalLength,
                    // 事件自定义属性
                    'var': user_set_properties
                };

                // userID、visitID和loginStatus 值初始化
                if (!this.instance.get_property('userId')) {
                    data['userId'] = '';
                }
                if (!this.instance.get_property('visitID')) {
                    data['visitID'] = '';
                }
                if (!this.instance.get_property('loginStatus')) {
                    data['loginStatus'] = '0';
                }

                // 合并客户端信息
                data = _.extend({}, data, _.info.properties());

                // 合并渠道推广信息
                data = _.extend({}, data, this.instance['channel'].get_channel_params());

                //只有已访问页面后，sessionReferrer 重置
                //如果不是内置事件，那么 sessionReferrer 重置
                //如果是'da_activate'，那么 sessionReferrer 重置
                //解决referrer 当是外链时，此时触发自定义事件，引起重启一个session问题。
                if (data_type === BUSSINESS_EVENT_TYPE) {
                    // 其它渠道
                    if (this._check_channel()) {
                        this['local_storage'].register({
                            sessionReferrer: document.URL
                        });
                    }
                }
                if (!this.instance._get_config('SPA').is) {
                    if (['activate', 'sessionClose'].indexOf(event_name) > 0) {
                        this['local_storage'].register({
                            sessionReferrer: document.URL
                        });
                    }
                }

                // 当启动单页面后，切换页面，refer为空，此时做处理
                if (this.instance._get_config('SPA').is) {
                    var sessionReferrer = this.instance.get_property('sessionReferrer');
                    if (sessionReferrer !== data['referrer']) {
                        data['prePageURL'] = sessionReferrer;
                        data['prePageDomain'] = _.info.domain(sessionReferrer);
                    }
                }

                //添加上报时间字段
                data['reportTime'] = new Date().getTime();

                // 上报数据对象字段截取
                var truncateLength = this.instance._get_config('truncateLength');
                var truncated_data = data;
                if (_.isNumber(truncateLength) && truncateLength > 0) {
                    truncated_data = _.truncate(data, truncateLength);
                }


                console.log('埋点数据（截取后）:', truncated_data);

                if (!checkData(truncated_data)) {
                    return;
                }

                var callback_fn = function callback_fn(response) {
                    callback(response, data);
                };

                var url = this.instance._get_config('track_url');
                var track_type = this.instance._get_config('track_type');
                if (track_type === 'img') {
                    url += 'track.gif';
                }

                //数据上报
                _.sendRequest(url, track_type, {
                    data: _.base64Encode(_.JSONEncode(truncated_data)),
                    token: this.instance._get_config('token')
                }, callback_fn);


                // 保存最后一次用户触发事件（除了会话事件以外）的事件id以及时间，通过这个时间确定会话关闭时的时间
                if (['sessionStart', 'sessionClose'].indexOf(event_name) === -1) {
                    this['local_storage'].register({
                        LASTEVENT: {
                            eventName: event_name,
                            time: time
                        }
                    });
                }
            }

        }, {
            /**
             * 用户登录和注册时调用
             * @param {String} user_id
             */
            key: 'login',
            value: function login(user_id) {
                // this._signup(user_id);
                this['local_storage'].register({'userId': user_id});
                this['local_storage'].register({'loginStatus': '1'});
                this.track(SYSTEM_EVENT_OBJECT.login.event_id, SYSTEM_EVENT_OBJECT.login.event_name, SYSTEM_EVENT_OBJECT.login.event_type);
            }
            // 清除本地用户信息，退出用户（选则调用）

        }, {
            key: 'logout',
            value: function logout() {
                this['local_storage'].register({'userId': ''});
                this['local_storage'].register({'loginStatus': '0'});
                this.track(SYSTEM_EVENT_OBJECT.logout.event_id, SYSTEM_EVENT_OBJECT.logout.event_name, SYSTEM_EVENT_OBJECT.logout.event_type);
            }
        }]);

        return EVENT_TRACK;
    }();

    var _createClass$2 = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck$2(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var LOCAL_STORAGE = function () {
        /**
         *
         * @param {Object} config
         */
        function LOCAL_STORAGE(config) {
            _classCallCheck$2(this, LOCAL_STORAGE);

            var local_storage = config['local_storage'];
            if (_.isObject(local_storage)) {
                this['name'] = local_storage['name'] || '' + config['token'] + '_sdk';
                var storage_type = local_storage['type'] || 'cookie';

                // 判断是否支持 localStorage
                var localStorage_supported = function localStorage_supported() {
                    var supported = true;
                    try {
                        var key = '__smartssupport__',
                            val = 'web_data_sdk';
                        _.localStorage.set(key, val);
                        if (_.localStorage.get(key) !== val) {
                            supported = false;
                        }
                        _.localStorage.remove(key);
                    } catch (error) {
                        supported = false;
                    }
                    if (!supported) {
                        console.error('localStorage 不支持，自动退回到cookie存储方式');
                    }
                    return supported;
                };

                if (storage_type === 'localStorage' && localStorage_supported()) {
                    this['storage'] = _.localStorage;
                } else {
                    this['storage'] = _.cookie;
                }

                this.load();
                this.update_config(local_storage);
                // TODO: upgrade
                this.upgrade();
                this.save();
            } else {
                console.error('local_storage配置设置错误');
            }
        }

        // 加载本地存储信息


        _createClass$2(LOCAL_STORAGE, [{
            key: 'load',
            value: function load() {
                var localData = this['storage'].parse(this['name']);
                if (localData) {
                    this['props'] = _.extend({}, localData);
                }
            }
            // 更新配置信息

        }, {
            key: 'update_config',
            value: function update_config(localStorageConfig) {
                // 到期时间(cookie存储设置有效)
                this.default_expiry = this.expire_days = localStorageConfig['cookie_expiration'];
                this.set_disabled(localStorageConfig['disable']);
                this.set_cross_subdomain(localStorageConfig['cross_subdomain_cookie']);
                this.set_secure(localStorageConfig['secure_cookie']);
            }
            // 设置关闭本地保存操作，设置为关闭后，本地数据移除

        }, {
            key: 'set_disabled',
            value: function set_disabled(disabled) {
                this.disabled = disabled;
                if (this.disabled) {
                    this.remove();
                }
            }
            // 移除本地数据

        }, {
            key: 'remove',
            value: function remove() {
                // cookie存储时，移除二级域以及子域下的cookie,此时参数有两个
                this.storage.remove(this.name, false);
                this.storage.remove(this.name, true);
            }
            // 清除存储的数据

        }, {
            key: 'clear',
            value: function clear() {
                this.remove();
                this['props'] = {};
            }
            /**
             * 跨子域设置,cookie存储方式下有效
             * @param {Boolean} cross_subdomain
             */

        }, {
            key: 'set_cross_subdomain',
            value: function set_cross_subdomain(cross_subdomain) {
                if (cross_subdomain !== this.cross_subdomain) {
                    this.cross_subdomain = cross_subdomain;
                    this.remove();
                    this.save();
                }
            }
            /**
             * cookie存储方式下有效
             * cookie存储时，采用安全的方式存储数据，调用该方法后，重新保存数据
             * 当secure属性设置为true时，cookie只有在https协议下才能上传到服务器，
             * 而在http协议下是没法上传的，所以也不会被窃听
             * @param {Boolean} secure
             */

        }, {
            key: 'set_secure',
            value: function set_secure(secure) {
                if (secure !== this.secure) {
                    this.secure = secure ? true : false;
                    this.remove();
                    this.save();
                }
            }
            // sdk升级，旧的sdk存储数据移到新的sdk存储数据中，然后删除旧的存储数据（暂不实现）
            // 存储方式改变，改为cookie切换到 localStorage

        }, {
            key: 'upgrade',
            value: function upgrade(config) {
                var old_cookie = void 0;
                if (this.storage === _.localStorage) {
                    old_cookie = _.cookie.parse(this.name);
                    _.cookie.remove(this.name);
                    _.cookie.remove(this.name, true);

                    if (old_cookie) {
                        this.register_once(old_cookie);
                    }
                }
            }
            // 数据保存到本地

        }, {
            key: 'save',
            value: function save() {
                // disabled配置为true, 数据不保存到本地
                if (this.disabled) {
                    return;
                }
                this.storage.set(this['name'], _.JSONEncode(this['props']), this.expire_days, this.cross_subdomain, this.secure);
            }
            /**
             * 缓存指定的数据，同时将该数据保存到本地
             * @param {Object} props
             * @param {Number} days
             * @returns {Boolean} 返回true表示成功
             */

        }, {
            key: 'register',
            value: function register(props, days) {
                if (_.isObject(props)) {
                    this.expire_days = typeof days === 'undefined' ? this.default_expiry : day;
                    _.extend(this['props'], props);
                    this.save();
                    return true;
                }
                return false;
            }
            /**
             * 只缓存一次指定的数据，下次设置该数据时不会覆盖前一次数据
             * 若想更新已设置的属性值，那么default_value参数值要等于本地缓存数据中需重置的属性的值(默认值)
             * this['props'][prop] === default_value   prop为需更新的属性
             * @param {Object} props
             * @param {*} default_value
             * @param {Number} days
             * @returns {Boolean} 返回true表示成功
             */

        }, {
            key: 'register_once',
            value: function register_once(props, default_value, days) {
                if (_.isObject(props)) {
                    if (typeof default_value === 'undefined') {
                        default_value = 'None';
                    }
                    this.expire_days = typeof days === 'undefined' ? this.default_expiry : day;

                    _.each(props, function (val, prop) {
                        if (!this['props'][prop] || this['props'][prop] === default_value) {
                            this['props'][prop] = val;
                        }
                    }, this);

                    this.save();
                    return true;
                }
                return false;
            }
            /**
             * 移除指定的缓存数据，同时也清除本地的对应数据
             * @param {string} prop
             */

        }, {
            key: 'unregister',
            value: function unregister(prop) {
                if (prop in this['props']) {
                    delete this['props'][prop];
                    this.save();
                }
            }
            /**
             * 设置一个事件计时器，记录用户触发指定事件需要的时间，同时保存到本地
             * @param {String} event_name 该计时器的名称
             * @param {Date} timestamp 该计时器开始时间戳
             */

        }, {
            key: 'set_event_timer',
            value: function set_event_timer(event_name, timestamp) {
                var timers = this['props']['costTime'] || {};
                timers[event_name] = timestamp;
                this['props']['costTime'] = timers;
                this.save();
            }
            /**
             * 移除指定计时器，同时将本地存储的该计时器信息清除
             * @param {String} event_name
             * @returns {Date} 返回移除该计时器的时间戳
             */

        }, {
            key: 'remove_event_timer',
            value: function remove_event_timer(event_name) {
                var timers = this['props']['costTime'] || {};
                var timestamp = timers[event_name];
                if (!_.isUndefined(timestamp)) {
                    delete this['props']['costTime'][event_name];
                    this.save();
                }
                return timestamp;
            }
        }]);

        return LOCAL_STORAGE;
    }();

    function on(obj, event, callFn) {
        if (obj[event]) {
            var fn = obj[event];
            obj[event] = function () {
                var args = Array.prototype.slice.call(arguments);
                callFn.apply(this, args);
                fn.apply(this, args);
            };
        } else {
            obj[event] = function () {
                var args = Array.prototype.slice.call(arguments);
                callFn.apply(this, args);
            };
        }
    }

    function getPath() {
        return location.pathname + location.search;
    }

    var SPA = {
        config: {
            mode: 'hash',
            track_replace_state: false,
            callback_fn: function callback_fn() {
            }
        },
        init: function init(config) {
            this.config = _.extend(this.config, config || {});
            this.path = getPath();
            this.url = document.URL;
            this.event();
        },
        event: function event() {
            if (this.config.mode === 'history') {
                if (!history.pushState || !window.addEventListener) return;
                on(history, 'pushState', this.pushStateOverride.bind(this));
                on(history, 'replaceState', this.replaceStateOverride.bind(this));
                window.addEventListener('popstate', this.handlePopState.bind(this));
            } else if (this.config.mode === 'hash') {
                _.register_hash_event(this.handleHashState.bind(this));
            }
        },
        pushStateOverride: function pushStateOverride() {
            this.handleUrlChange(true);
        },
        replaceStateOverride: function replaceStateOverride() {
            this.handleUrlChange(false);
        },
        handlePopState: function handlePopState() {
            this.handleUrlChange(true);
        },
        handleHashState: function handleHashState() {
            this.handleUrlChange(true);
        },
        handleUrlChange: function handleUrlChange(historyDidUpdate) {
            var _this = this;

            setTimeout(function () {
                if (_this.config.mode === 'hash') {
                    if (_.isFunction(_this.config.callback_fn)) {
                        _this.config.callback_fn.call();
                        _.innerEvent.trigger('singlePage:change', {
                            oldUrl: _this.url,
                            nowUrl: document.URL
                        });
                        _this.url = document.URL;
                    }
                } else if (_this.config.mode === 'history') {
                    var oldPath = _this.path;
                    var newPath = getPath();
                    if (oldPath != newPath && _this.shouldTrackUrlChange(newPath, oldPath)) {
                        _this.path = newPath;
                        if (historyDidUpdate || _this.config.track_replace_state) {
                            if (typeof _this.config.callback_fn === 'function') {
                                _this.config.callback_fn.call();
                                _.innerEvent.trigger('singlePage:change', {
                                    oldUrl: _this.url,
                                    nowUrl: document.URL
                                });
                                _this.url = document.URL;
                            }
                        }
                    }
                }
            }, 0);
        },
        shouldTrackUrlChange: function shouldTrackUrlChange(newPath, oldPath) {
            return !!(newPath && oldPath);
        }
    };

    var _createClass$3 = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck$3(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var CHANNEL = function () {
        function CHANNEL(instance) {
            _classCallCheck$3(this, CHANNEL);

            this.instance = instance;
            // 渠道推广的参数信息
            this.channel_params = {};
            this.cookie_name = '' + this.instance._get_config('token') + '_c';
            this._set_channel_params();
        }

        _createClass$3(CHANNEL, [{
            key: '_change',
            value: function _change() {
            }
            // 从url 或 本地cookie 拿取推广信息

        }, {
            key: '_set_channel_params',
            value: function _set_channel_params() {
                // 从url上拿取，此时还需保存到本地cookie
                if (this._check_chennel()) {
                    this.channel_params = this._url_channel_params();
                    this._save();
                } else {
                    // 从本地cookie拿取
                    var cookie = _.cookie.get(this.cookie_name);
                    if (cookie) {
                        this.channel_params = _.JSONDecode(cookie);
                    }
                }
            }
            // 得到url上推广的参数信息

        }, {
            key: '_url_channel_params',
            value: function _url_channel_params() {
                var channel_keywords = 'utm_source utm_medium utm_campaign utm_content utm_term promotional_id'.split(' ');
                var val = '';
                var params = {};
                _.each(channel_keywords, function (key) {
                    val = _.getQueryParam(document.URL, key);
                    if (val) {
                        params[key] = val;
                    }
                });
                return params;
            }
            // 检测是否为渠道推广

        }, {
            key: '_check_chennel',
            value: function _check_chennel() {
                var params = this._url_channel_params();
                var is_channel = false;
                if (params.utm_source && params.utm_medium && params.utm_campaign && params.promotional_id) {
                    is_channel = true;
                }
                return is_channel;
            }
            // 将推广参数值保存到客户端本地的cookie，30天后失效

        }, {
            key: '_save',
            value: function _save() {
                if (this._check_chennel()) {
                    _.cookie.set(this.cookie_name, _.JSONEncode(this.channel_params), 30, this.instance._get_config('local_storage').cross_subdomain_cookie);
                }
            }
            // 检测是否要上报广告点击事件
            // 条件： 1. 必须是渠道推广；2. 必须有 referrer；3. 当前打开的页面url必须是对外推广的url（有短链和长链）, 表现为当前url上的参数无 t_re(turn_redirect) 字段值；
            // 其它说明：一般情况下对外推广的链接是短链（不一定跟落地页域名一致），但有些渠道不支持，那么只能使用长链（落地页url+ 推广参数）

        }, {
            key: 'check_ad_click',
            value: function check_ad_click() {
                var is_ad_click = false;
                var t_re = _.getQueryParam(document.URL, 't_re');
                if (this._check_chennel()) {
                    if (document.referrer && !t_re) {
                        is_ad_click = true;
                    }
                }
                return is_ad_click;
            }
            // 返回参数

        }, {
            key: 'get_channel_params',
            value: function get_channel_params() {
                this._set_channel_params();
                var params = {
                    utmSource: this.channel_params.utm_source,
                    utmMedium: this.channel_params.utm_medium,
                    promotionalID: this.channel_params.promotional_id,
                    utmCampaign: this.channel_params.utm_campaign,
                    utmContent: this.channel_params.utm_content,
                    utmTerm: this.channel_params.utm_term
                };
                return _.deleteEmptyProperty(params);
            }
        }]);

        return CHANNEL;
    }();

    var _createClass$4 = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck$4(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var LOAD_CONTROL_JS = function () {
        function LOAD_CONTROL_JS(instance) {
            _classCallCheck$4(this, LOAD_CONTROL_JS);

            this.instance = instance;
            this._load_js();
        }

        _createClass$4(LOAD_CONTROL_JS, [{
            key: '_load_js',
            value: function _load_js() {
            }
            // 拉取可视化埋点（圈选）插件

        }, {
            key: '_load_visualization',
            value: function _load_visualization() {
            }
        }, {
            key: 'is_visualization',
            value: function is_visualization() {
            }
        }]);

        return LOAD_CONTROL_JS;
    }();

    var _createClass$5 = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck$5(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var SMARTLib = function () {
        /**
         *
         * @param {String} token 上报数据凭证
         * @param {Object} config sdk客户端配置
         */
        function SMARTLib(token, config) {
            _classCallCheck$5(this, SMARTLib);

            this['__loaded'] = true;
            this._ = _;
            this['config'] = {};
            this._set_config(_.extend({}, DEFAULT_CONFIG, PRODUCT_CONFIG, SDK_CONFIG, SYSTEM_CONFIG, config, {'token': token}));
            this['local_storage'] = new LOCAL_STORAGE(this['config']);
            // 运行钩子函数
            this._loaded();
            // 实例化拉取远程库对象（按需加载）
            this['load_control_js'] = new LOAD_CONTROL_JS(this);
            // 实例化事件对象
            this['event'] = new EVENT_TRACK(this);
            // 实例化用户对象
            this['user'] = new USER_TRACK(this);
            // 实例化渠道跟踪对象
            this['channel'] = new CHANNEL(this);

            this._set_ip();

            var _this = this;
            //延迟1秒，以等待IP存储localStorage
            setTimeout(function () {
                // 设置设备凭证
                _this._set_device_id();

                // 上报广告点击事件
                if (_this['channel'].check_ad_click()) {
                    _this._ad_click();
                }

                _this._track_pv();
            }, 1000)

            // persistedTime 首次访问应用时间
            this['local_storage'].register_once({'persistedTime': new Date().getTime()}, '');
            // 单页面
            if (this._get_config('SPA').is) {
                this._SPA();
            }
        }

        // 广告点击事件
        _createClass$5(SMARTLib, [{
            key: '_ad_click',
            value: function _ad_click() {
                this.track_event(SYSTEM_EVENT_OBJECT.adClick.event_id, SYSTEM_EVENT_OBJECT.adClick.event_name, SYSTEM_EVENT_OBJECT.adClick.event_type);
            }
            // 内部使用的PV方法

        }, {
            key: '_track_pv',
            value: function _track_pv(properties, callback) {
                // 配置为自动触发PV事件
                if (this._get_config('pageview')) {
                    this['event'].track_pv(properties, callback);
                } else {
                    // 若没有自动触发事件，还需检测session (说明：当触发PV 时，实际已经检测了session)
                    this['event']._session();
                }
            }
            // 单页面应用（影响PV）

        }, {
            key: '_SPA',
            value: function _SPA() {
                var _this = this;

                SPA.init({
                    mode: this._get_config('SPA').mode,
                    callback_fn: function callback_fn() {
                        _this._track_pv();
                    }
                });
            }
            /**
             * 设置配置
             * @param {Object} config
             */

        }, {
            key: '_set_config',
            value: function _set_config(config) {
                if (_.isObject(config)) {
                    this['config'] = _.extend(this['config'], config);
                    SYSTEM_CONFIG.DEBUG = SYSTEM_CONFIG.DEBUG || this._get_config('debug');
                }
            }
            /**
             * 获取某个配置
             * @param {String} prop_name
             * @returns {*}
             */

        }, {
            key: '_get_config',
            value: function _get_config(prop_name) {
                return this['config'][prop_name];
            }
            // sdk初始化之前触发的钩子函数，该方法必须在初始化子模块前以及上报数据前使用

        }, {
            key: '_loaded',
            value: function _loaded() {
                try {
                    this._get_config('loaded')(this);
                } catch (error) {
                    console.error(error);
                }
            }
            /**
             * 设置本地设备凭证
             * 若是首次访问（本地无设备凭证），上报用户首次访问网站事件
             */

        }, {
            key: '_set_ip',
            value: function _set_ip() {
                var _this = this;
                loadJS('http://pv.sohu.com/cityjson?ie=utf-8', function () {
                    _this['local_storage'].register({'ip': returnCitySN['cip']});
                });
            }
        }, {
            key: '_set_device_id',
            value: function _set_device_id() {
                var track_data = {};
                if (!this.get_device_id()) {
                    this['local_storage'].register_once({'deviceID': _.UUID()}, '');
                    track_data = this.track_event(SYSTEM_EVENT_OBJECT.activate.event_id, SYSTEM_EVENT_OBJECT.activate.event_name, SYSTEM_EVENT_OBJECT.activate.event_type);
                }
                return track_data;
            }

            // 获取唯一凭证（设备标记）

        }, {
            key: 'get_device_id',
            value: function get_device_id() {
                return this.get_property('deviceID');
            }
            // 获取指定本地存储属性（缓存和本地）

        }, {
            key: 'get_property',
            value: function get_property(prop_name) {
                return this['local_storage']['props'][prop_name];
            }
            /**
             * 设置一个指定事件的耗时监听器
             * @param {String} event_name
             */

        }, {
            key: 'time_event',
            value: function time_event(event_name) {
                this['event'].time_event(event_name);
            }
            /**
             * 发送PV事件，在此之前检测session
             * @param {Object} properties  pv属性
             * @param {*} callback
             */

        }, {
            key: 'track_pv',
            value: function track_pv(properties, callback) {
                this['event'].track_pv(properties, callback);
            }
            /**
             * 追踪事件（上报用户事件触发数据）
             * @param {String} event_name 事件名称（必须）
             * @param {Object} properties 事件属性
             * @param {Function} callback 上报后的回调方法
             * @param {String} event_type 自定义事件类型
             * @returns {Object} track_data 上报的数据
             */

        }, {
            key: 'track_event',
            value: function track_event(event_id, event_name, event_type, properties, callback) {
                this['event'].track(event_id, event_name, event_type, properties, callback);
            }
        }, {
            key: 'set_visit_id',
            value: function set_visit_id(visitID) {
                this['local_storage'].register({'visitID': visitID});
            }
        }, {
            key: 'clear_visit_id',
            value: function clear_visit_id() {
                this['local_storage'].register({'visitID': ''});
            }
        }, {
            key: 'register_event_super_properties',
            value: function register_event_super_properties(prop, to) {
                var set_props = {};
                var super_properties = this.get_property('superProperties');
                if (_.isObject(prop)) {
                    _.each(prop, function (v, k) {
                        set_props[k] = v;
                    });
                } else {
                    set_props[prop] = to;
                }
                // 注意合并顺序
                super_properties = _.extend({}, super_properties, set_props);
                this['local_storage'].register({
                    superProperties: super_properties
                });
            }
            /**
             * 设置事件自定义通用属性
             * 成功设置事件通用属性后，再通过 track_event: 追踪事件时，事件通用属性会被添加进每个事件中。
             * 不覆盖之前已经设定的通用属性。
             */

        }, {
            key: 'register_event_super_properties_once',
            value: function register_event_super_properties_once(prop, to) {
                var set_props = {};
                var super_properties = this.get_property('superProperties');
                if (_.isObject(prop)) {
                    _.each(prop, function (v, k) {
                        set_props[k] = v;
                    });
                } else {
                    set_props[prop] = to;
                }
                // 注意合并顺序
                super_properties = _.extend({}, set_props, super_properties);
                this['local_storage'].register({
                    superProperties: super_properties
                });
            }
            /**
             * 删除指定通用事件属性
             * @param {String} prop_name
             */

        }, {
            key: 'unregister_event_super_properties',
            value: function unregister_event_super_properties(prop_name) {
                if (_.isString(prop_name)) {
                    var super_properties = this.get_property('superProperties');
                    if (_.isObject(super_properties)) {
                        delete super_properties[prop_name];
                        this['local_storage'].register({
                            superProperties: super_properties
                        });
                    }
                }
            }
            /**
             * 清除本地已设置的通用事件属性
             */

        }, {
            key: 'clear_event_super_properties',
            value: function clear_event_super_properties() {
                this['local_storage'].register({
                    superProperties: {}
                });
            }
            /**
             * 查看当前已设置的通用事件属性
             */

        }, {
            key: 'current_event_super_properties',
            value: function current_event_super_properties() {
                return this.get_property('superProperties');
            }
        }, {
            key: 'login',
            value: function login(user_id) {
                this['event'].login(user_id);
            }
            // 清除本地用户信息，退出用户（选则调用）,建议平台网站不必调用（无需匿名用户的平台）
        }, {
            key: 'logout',
            value: function logout() {
                this['event'].logout();
            }
        }]);

        return SMARTLib;
    }();

    var _createClass$6 = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    function _classCallCheck$6(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    //加载外部JS
    function loadJS(url, callback) {
        var script = document.createElement("script")
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others: Firefox, Safari, Chrome, and Opera
            script.onload = function () {
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    //埋点数据校验,如果校验失败，会禁止上报
    function checkData(data) {
        var pass = true;

        if (data['deviceID'] === '' || !data['deviceID']) {
            console.error('deviceID 为空，禁止上报');
            pass = false
        }
        //激活事件，sessionID可为空
        if (data['eventName'] === 'activate') {
        } else {
            //非激活事件，sessionID不能为空
            if (data['sessionID'] === '' || !data['sessionID']) {
                console.error('sessionID 为空，禁止上报');
                pass = false
            }
        }
        if (data['eventID'] === '' || !data['eventID']) {
            console.error('eventID 为空，禁止上报');
            pass = false
        }
        if (data['eventName'] === '' || !data['eventName']) {
            console.error('eventName 为空，禁止上报');
            pass = false
        }
        if (data['eventType'] === '' || !data['eventType']) {
            console.error('eventType 为空，禁止上报');
            pass = false
        }
        if (data['productCode'] === '' || !data['productCode']) {
            console.error('productCode 为空，禁止上报');
            pass = false
        }
        if (data['productName'] === '' || !data['productName']) {
            console.error('productName 为空，禁止上报');
            pass = false
        }
        if (data['productVer'] === '' || !data['productVer']) {
            console.error('productVer 为空，禁止上报');
            pass = false
        }
        if (data['siteType'] === '' || !data['siteType']) {
            console.error('siteType 为空，禁止上报');
            pass = false
        }
        if (data['terminalType'] === '' || !data['terminalType']) {
            console.error('terminalType 为空，禁止上报');
            pass = false
        }
        return pass;
    }

    var LoaderSync = function () {
        function LoaderSync() {
            _classCallCheck$6(this, LoaderSync);

            window['iask_web'] = this;
        }

        _createClass$6(LoaderSync, [{
            key: 'init',
            value: function init(token, config) {
                if (this['__loaded']) {
                    return;
                }
                this.instance = new SMARTLib(token, config);
                this.instance.init = this['init'];
                window['iask_web'] = this.instance;
            }
        }]);

        return LoaderSync;
    }();

    new LoaderSync();
}());
