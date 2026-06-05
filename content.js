window.vaultStats = {
  "vaultPath": "C:\\Users\\LENOVO\\Documents\\Obsidian Vault",
  "totalNotes": 41,
  "publishableNotes": 35,
  "focusCount": 4,
  "latestDate": "2026-06-04",
  "topCounts": {
    "Linux入门": 4,
    "PYTHON后端": 31,
    "学习方向": 5,
    "静态web.md": 1
  }
};

window.learningPosts = [
  {
    "title": "WSL代理 apt和Docker下载卡住",
    "type": "问题记录",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "Docker",
      "WSL",
      "Linux",
      "数据库"
    ],
    "summary": "在 WSL2 Ubuntu 26.04 里安装 Docker 时， sudo apt update 出现 Waiting for headers ，Docker 拉取 hello world 镜像时出现 TLS ha",
    "source": "Linux入门\\问题记录\\WSL代理-apt和Docker下载卡住.md"
  },
  {
    "title": "Docker安装与hello world验证 WSL",
    "type": "Docker",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "Docker",
      "WSL",
      "Linux"
    ],
    "summary": "Docker 第一天的目标不是先写 Dockerfile，而是先确认 Linux/WSL 环境里 Docker 能真正运行容器。用户环境是 WSL2 Ubuntu 26.04，最初 docker version 提示",
    "source": "PYTHON后端\\Docker\\01-Docker第一天\\Docker安装与hello-world验证-WSL.md"
  },
  {
    "title": "请求响应模型",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "数据库",
      "项目结构"
    ],
    "summary": "该模块已拆分为一步一步的学习笔记。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型.md"
  },
  {
    "title": "PATCH /tasks/{task id} 局部更新任务",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库",
      "项目结构"
    ],
    "summary": "PUT 更新任务时通常要求前端提交完整任务数据，例如 title 、 description 、 done 都要传。实际开发中，经常只想修改一个字段，例如只把 done 改成 true ，这时继续使用 PUT 会显得",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\PATCH-tasks-task_id-局部更新任务.md"
  },
  {
    "title": "response_model 完整规范所有接口",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库"
    ],
    "summary": "接口虽然已经能返回数据，但 PUT 和 DELETE 如果不声明 response model ，返回结构就不够明确。这样会让自动文档不清楚，前端也不容易判断接口到底会返回哪些字段。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\response_model-完整规范所有接口.md"
  },
  {
    "title": "schemas 拼写错误导致 ForwardRef 报错",
    "type": "问题记录",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库",
      "项目结构"
    ],
    "summary": "访问 /docs 时 FastAPI 生成 OpenAPI 文档失败，报出 PydanticUserError，并提示 ForwardRef('shcemas.TaskCreate') 没有完整定义。问题出现在接口参",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\schemas-拼写错误导致ForwardRef报错.md"
  },
  {
    "title": "schemas.py 拆分请求模型",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库",
      "项目结构"
    ],
    "summary": "数据库版 CRUD 完成后， main.py 里开始混合 FastAPI app、数据库依赖、接口函数和 Pydantic 模型。代码继续变大时，所有内容堆在 main.py 会难以维护。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\schemas.py-拆分请求模型.md"
  },
  {
    "title": "schemas.py 添加响应模型",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "TaskCreate 只描述客户端提交的数据，但接口返回给客户端的数据也需要明确结构。数据库返回的是 SQLAlchemy ORM 对象，如果不声明响应模型，接口返回会不够规范，也不方便控制哪些字段应该暴露。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\schemas.py-添加响应模型.md"
  },
  {
    "title": "DELETE /tasks/{task id} 删除数据库任务",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "数据库版 GET 、 POST 、 PUT 已经完成，但删除任务仍需要从内存列表写法切换为数据库写法。否则任务删除不会真正作用于 SQLite 数据库。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\DELETE-tasks-task_id-删除数据库任务.md"
  },
  {
    "title": "项目结构",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "项目结构"
    ],
    "summary": "FastAPI 项目结构相关笔记入口。",
    "source": "PYTHON后端\\FASTAPI\\项目结构.md"
  },
  {
    "title": "APIRouter 拆分项目结构",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库",
      "项目结构"
    ],
    "summary": "学习阶段把所有接口都写在 main.py 里可以快速理解 FastAPI，但真实项目里接口会越来越多。如果继续把数据库创建、依赖函数、任务接口、用户接口都堆在 main.py ，后面会很难维护和查找。",
    "source": "PYTHON后端\\FASTAPI\\项目结构\\APIRouter-拆分项目结构.md"
  },
  {
    "title": "routers/tasks.py 迁移任务接口",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库",
      "项目结构"
    ],
    "summary": "任务接口已经从内存版 CRUD 发展到数据库版 CRUD，又加入了 response model 和 PATCH 。如果继续把所有接口都放在 main.py ，文件会越来越长，学习时也不容易区分“应用入口”和“业务接",
    "source": "PYTHON后端\\FASTAPI\\项目结构\\routers-tasks.py-迁移任务接口.md"
  },
  {
    "title": "LOGIC",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "Linux",
      "数据库"
    ],
    "summary": "请求进来 schemas检查数据格式 创建数据库会话拿权限资源 ORM CRUD库 响应返回信息",
    "source": "PYTHON后端\\FASTAPI\\LOGIC.md"
  },
  {
    "title": "数据库接入",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "数据库",
      "项目结构"
    ],
    "summary": "该模块已拆分为一步一步的学习笔记。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入.md"
  },
  {
    "title": "database.py 数据库连接配置",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "项目准备从内存列表切换到数据库存储，但在写数据库表模型和 CRUD 之前，需要先有一个统一的数据库连接入口。否则后续每个接口都会重复写连接逻辑，项目结构会越来越乱。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\database.py-数据库连接配置.md"
  },
  {
    "title": "get db 数据库会话依赖",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "数据库和表已经能创建，但接口函数还不能直接操作数据库。每次请求都需要一个数据库会话，并且请求结束后要关闭会话，否则连接管理会混乱。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\get_db-数据库会话依赖.md"
  },
  {
    "title": "GET /tasks 查询数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "接口已经能拿到数据库会话，但 GET /tasks 仍然可能在读取内存列表 tasks [] 。这样即使数据库表已经创建，查询接口也没有真正使用数据库。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\GET-tasks-查询数据库任务.md"
  },
  {
    "title": "GET /tasks/{task id} 查询单个数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "GET /tasks 已经能查询数据库中的全部任务，但真实 API 还需要根据 id 查询单个任务。如果继续遍历内存列表，就没有真正使用数据库，也不能和数据库新增的数据保持一致。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\GET-tasks-task_id-查询单个数据库任务.md"
  },
  {
    "title": "main.py 自动创建数据库表",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "已经定义了 database.py 和 models.py ，但数据库表还没有真正创建出来。仅仅写好 ORM 模型类，不等于 SQLite 数据库里已经有 tasks 表。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\main.py-自动创建数据库表.md"
  },
  {
    "title": "models.py 定义任务表模型",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "已经有了 database.py 的数据库连接配置，但数据库里还没有真正的任务表。后端需要告诉 SQLAlchemy：任务表叫什么、有哪些字段、每个字段是什么类型。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\models.py-定义任务表模型.md"
  },
  {
    "title": "POST /tasks 新增数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "GET /tasks 已经能从数据库查询任务，但数据库里还没有新增任务的入口。如果 POST /tasks 仍然把任务追加到内存列表 tasks [] ，新增的数据不会持久保存，服务重启后仍然会丢失。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\POST-tasks-新增数据库任务.md"
  },
  {
    "title": "PUT tasks task_id 更新数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "任务已经可以写入数据库、查询全部和查询单个，但修改任务仍然需要从内存列表写法切换到数据库写法。否则更新后的任务不会持久保存。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\PUT-tasks-task_id-更新数据库任务.md"
  },
  {
    "title": "CRUD 接口",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "项目结构"
    ],
    "summary": "该模块已拆分为一步一步的学习笔记。",
    "source": "PYTHON后端\\FASTAPI\\CRUD接口.md"
  },
  {
    "title": "DELETE 删除任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "SQLAlchemy",
      "CRUD",
      "数据库"
    ],
    "summary": "任务可以新增、查询、修改后，还需要能删除不再需要的任务。否则任务列表只能越堆越多，CRUD 也不完整。",
    "source": "PYTHON后端\\FASTAPI\\CRUD接口\\DELETE-tasks-task_id-删除任务.md"
  },
  {
    "title": "PUT 更新任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "tags": [
      "FastAPI",
      "CRUD",
      "数据库",
      "项目结构"
    ],
    "summary": "前面已经能查询和新增任务，但还不能修改已有任务。真实任务管理 API 需要支持用户把任务标题、描述或完成状态改掉。",
    "source": "PYTHON后端\\FASTAPI\\CRUD接口\\PUT-tasks-task_id-更新任务.md"
  },
  {
    "title": "常用命令",
    "type": "Linux",
    "date": "2026-06-02",
    "minutes": 6,
    "tags": [
      "FastAPI",
      "CRUD",
      "WSL",
      "Linux"
    ],
    "summary": "分类 命令 作用 常用示例 示例说明",
    "source": "Linux入门\\常用命令.md"
  },
  {
    "title": "问题记录",
    "type": "问题记录",
    "date": "2026-06-02",
    "minutes": 3,
    "tags": [
      "Linux"
    ],
    "summary": "python3 m venv .venv",
    "source": "Linux入门\\问题记录.md"
  },
  {
    "title": "静态web",
    "type": "发布",
    "date": "2026-06-01",
    "minutes": 3,
    "tags": [
      "GitHub Pages"
    ],
    "summary": "第 1 阶段：Obsidian 记录学习",
    "source": "静态web.md"
  },
  {
    "title": "AI 与 ERP：",
    "type": "方向",
    "date": "2026-05-28",
    "minutes": 3,
    "tags": [
      "Docker",
      "AI"
    ],
    "summary": "!Pasted image 20260528103103.png",
    "source": "学习方向\\AI 与 ERP：.md"
  },
  {
    "title": "AI workflow搭建",
    "type": "方向",
    "date": "2026-05-28",
    "minutes": 3,
    "tags": [
      "数据库",
      "AI"
    ],
    "summary": "将每个具体真实问题试着用AI解决， 记录哪种方法有用，那种方法没有用",
    "source": "学习方向\\AI workflow搭建.md"
  },
  {
    "title": "AI视频制作",
    "type": "方向",
    "date": "2026-05-28",
    "minutes": 3,
    "tags": [
      "AI"
    ],
    "summary": "这篇笔记来自 Obsidian，等待继续补充正文和复盘。",
    "source": "学习方向\\AI视频制作.md"
  },
  {
    "title": "SUBSCIBE AI",
    "type": "方向",
    "date": "2026-05-28",
    "minutes": 3,
    "tags": [
      "AI"
    ],
    "summary": "1、直接订阅 需要有实体卡之类的 visa 万事达等 礼品卡",
    "source": "学习方向\\SUBSCIBE AI.md"
  },
  {
    "title": "VPS VPN搭建",
    "type": "方向",
    "date": "2026-05-28",
    "minutes": 3,
    "tags": [],
    "summary": "这篇笔记来自 Obsidian，等待继续补充正文和复盘。",
    "source": "学习方向\\VPS VPN搭建.md"
  },
  {
    "title": "MYSQL +py",
    "type": "数据库",
    "date": "2026-03-24",
    "minutes": 3,
    "tags": [
      "Docker",
      "数据库"
    ],
    "summary": "except exception as e:",
    "source": "PYTHON后端\\DB\\数据库相关学习\\MYSQL +py.md"
  },
  {
    "title": "MYSQL",
    "type": "数据库",
    "date": "2026-03-23",
    "minutes": 14,
    "tags": [
      "CRUD",
      "Linux",
      "数据库"
    ],
    "summary": "·cd C:\\\\Program Files\\\\MySQL\\\\MySQL Server 8.0\\\\bin",
    "source": "PYTHON后端\\DB\\数据库相关学习\\MYSQL.md"
  }
];
