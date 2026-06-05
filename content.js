window.vaultStats = {
  "vaultPath": "C:\\Users\\LENOVO\\Documents\\Obsidian Vault",
  "totalNotes": 30,
  "publishableNotes": 24,
  "focusCount": 2,
  "latestDate": "2026-06-05",
  "topCounts": {
    "Linux入门": 4,
    "PYTHON后端": 26
  },
  "categoryTree": {
    "key": "全部",
    "label": "全部",
    "count": 24,
    "children": [
      {
        "key": "Linux入门",
        "label": "Linux入门",
        "count": 3,
        "children": [
          {
            "key": "Linux入门/问题记录",
            "label": "问题记录",
            "count": 2,
            "children": []
          },
          {
            "key": "Linux入门/常用命令",
            "label": "常用命令",
            "count": 1,
            "children": []
          }
        ]
      },
      {
        "key": "PYTHON后端",
        "label": "PYTHON后端",
        "count": 21,
        "children": [
          {
            "key": "PYTHON后端/DB",
            "label": "DB",
            "count": 1,
            "children": []
          },
          {
            "key": "PYTHON后端/Docker",
            "label": "Docker",
            "count": 1,
            "children": []
          },
          {
            "key": "PYTHON后端/FASTAPI",
            "label": "FASTAPI",
            "count": 19,
            "children": [
              {
                "key": "PYTHON后端/FASTAPI/请求响应模型",
                "label": "请求响应模型",
                "count": 5,
                "children": []
              },
              {
                "key": "PYTHON后端/FASTAPI/数据库接入",
                "label": "数据库接入",
                "count": 9,
                "children": []
              },
              {
                "key": "PYTHON后端/FASTAPI/CRUD接口",
                "label": "CRUD接口",
                "count": 2,
                "children": []
              },
              {
                "key": "PYTHON后端/FASTAPI/routers",
                "label": "routers",
                "count": 2,
                "children": []
              }
            ]
          }
        ]
      }
    ]
  }
};

window.learningPosts = [
  {
    "slug": "python后端-fastapi-routers-apirouter-拆分项目结构",
    "title": "APIRouter 拆分项目结构",
    "type": "FastAPI",
    "date": "2026-06-05",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/routers",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "routers"
    ],
    "tags": [
      "FASTAPI",
      "routers"
    ],
    "summary": "学习阶段把所有接口都写在 main.py 里可以快速理解 FastAPI，但真实项目里接口会越来越多。如果继续把数据库创建、依赖函数、任务接口、用户接口都堆在 main.py ，后面会很难维护和查找。",
    "source": "PYTHON后端\\FASTAPI\\routers\\APIRouter-拆分项目结构.md",
    "body": "## 问题是什么\n\n学习阶段把所有接口都写在 `main.py` 里可以快速理解 FastAPI，但真实项目里接口会越来越多。如果继续把数据库创建、依赖函数、任务接口、用户接口都堆在 `main.py`，后面会很难维护和查找。\n\n## 用了什么知识点\n\n- `APIRouter`：把一组相关接口拆成一个独立路由模块。\n- `prefix`：给一组接口统一添加路径前缀，例如 `/tasks`。\n- `tags`：给接口文档分组。\n- `app.include_router()`：把拆出去的路由挂回 FastAPI 应用。\n- 模块化项目结构：`main.py` 只负责应用入口，具体接口放到 `routers/`。\n\n## 怎么解决\n\n推荐把项目整理成：\n\n```text\nfastapi/\n├── main.py\n├── database.py\n├── models.py\n├── schemas.py\n└── routers/\n    └── tasks.py\n```\n\n在 `routers/tasks.py` 中创建路由对象：\n\n```python\nrouter = APIRouter(\n    prefix=\"/tasks\",\n    tags=[\"tasks\"]\n)\n```\n\n原来的：\n\n```python\n@app.get(\"/tasks\")\n```\n\n拆出去后变成：\n\n```python\n@router.get(\"\")\n```\n\n因为 `/tasks` 已经放进了 `prefix`。\n\n最后在 `main.py` 中挂载：\n\n```python\napp.include_router(tasks.router)\n```\n\n## 解决了什么问题\n\n`main.py` 不再承担所有业务接口，只保留应用入口、建表和路由挂载。任务相关接口集中到 `routers/tasks.py`，以后新增用户、认证、文章等模块时，也可以继续按同样方式拆分。\n\n## 易错点\n\n- 使用了 `prefix=\"/tasks\"` 后，`@router.get(\"\")` 才对应 `GET /tasks`。\n- 如果写成 `@router.get(\"/tasks\")`，最终路径会变成 `/tasks/tasks`。\n- 拆出去后要在 `main.py` 中执行 `app.include_router(tasks.router)`。\n- `routers` 文件夹需要有 `__init__.py`，这样 Python 才能稳定按包导入。\n\n## 验证方式\n\n启动服务后打开：\n\n```text\nhttp://127.0.0.1:8000/docs\n```\n\n确认任务接口仍然存在：\n\n- `GET /tasks`\n- `GET /tasks/{task_id}`\n- `POST /tasks`\n- `PUT /tasks/{task_id}`\n- `PATCH /tasks/{task_id}`\n- `DELETE /tasks/{task_id}`\n\n如果路径没有变，说明拆分成功。"
  },
  {
    "slug": "python后端-fastapi-routers-routers-taskspy-迁移任务接口",
    "title": "routers tasks.py 迁移任务接口",
    "type": "FastAPI",
    "date": "2026-06-05",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/routers",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "routers"
    ],
    "tags": [
      "FASTAPI",
      "routers"
    ],
    "summary": "任务接口已经从内存版 CRUD 发展到数据库版 CRUD，又加入了 response model 和 PATCH 。如果继续把所有接口都放在 main.py ，文件会越来越长，学习时也不容易区分“应用入口”和“业务接",
    "source": "PYTHON后端\\FASTAPI\\routers\\routers-tasks.py-迁移任务接口.md",
    "body": "## 问题是什么\n\n任务接口已经从内存版 CRUD 发展到数据库版 CRUD，又加入了 `response_model` 和 `PATCH`。如果继续把所有接口都放在 `main.py`，文件会越来越长，学习时也不容易区分“应用入口”和“业务接口”。\n\n## 用了什么知识点\n\n- `APIRouter`：把同一类接口组织到单独模块。\n- `prefix=\"/tasks\"`：给任务接口统一加路径前缀。\n- `tags=[\"tasks\"]`：在 Swagger 文档中给任务接口分组。\n- `app.include_router()`：把拆出去的路由重新挂回 FastAPI 应用。\n- 项目分层：`main.py` 做入口，`routers/tasks.py` 写任务接口。\n\n## 怎么解决\n\n创建目录结构：\n\n```text\nfastapi/\n├── main.py\n├── database.py\n├── models.py\n├── schemas.py\n└── routers/\n    ├── __init__.py\n    └── tasks.py\n```\n\n在 `routers/tasks.py` 中定义路由对象：\n\n```python\nrouter = APIRouter(\n    prefix=\"/tasks\",\n    tags=[\"tasks\"]\n)\n```\n\n把原来的任务接口从 `@app.get()`、`@app.post()` 等形式改为 `@router.get()`、`@router.post()`：\n\n```python\n@router.get(\"\", response_model=list[schemas.TaskRead])\ndef get_tasks(db: Session = Depends(get_db)):\n    return db.query(models.TaskModel).all()\n```\n\n在 `main.py` 中只保留应用入口和路由挂载：\n\n```python\nfrom fastapi import FastAPI\n\nimport models\nfrom database import engine\nfrom routers import tasks\n\napp = FastAPI()\n\nmodels.Base.metadata.create_all(bind=engine)\n\napp.include_router(tasks.router)\n```\n\n## 解决了什么问题\n\n`main.py` 不再堆满所有接口，任务相关代码有了自己的位置。以后继续扩展用户、登录、文章、文件上传等功能时，可以继续新增不同的 router 文件，而不是把所有内容混在一个文件里。\n\n## 易错点\n\n- `prefix=\"/tasks\"` 已经包含 `/tasks`，所以查询全部任务应写 `@router.get(\"\")`，不是 `@router.get(\"/tasks\")`。\n- 查询单个任务应写 `@router.get(\"/{task_id}\")`，最终路径才是 `/tasks/{task_id}`。\n- 拆分后别忘了在 `main.py` 里 `app.include_router(tasks.router)`。\n- `routers` 文件夹建议创建 `__init__.py`，让它成为稳定的 Python 包。\n\n## 验证方式\n\n启动服务后打开：\n\n```text\nhttp://127.0.0.1:8000/docs\n```\n\n确认原来的接口路径没有变化：\n\n- `GET /tasks`\n- `GET /tasks/{task_id}`\n- `POST /tasks`\n- `PUT /tasks/{task_id}`\n- `PATCH /tasks/{task_id}`\n- `DELETE /tasks/{task_id}`\n\n如果路径仍然正常，说明迁移成功。\n\n## 下一步\n\n下一步做 FastAPI 入门收尾：整理最终项目结构，明确以后用 AI 开发时只需要掌握哪些核心判断点。"
  },
  {
    "slug": "linux入门-问题记录-wsl代理-apt和docker下载卡住",
    "title": "WSL代理 apt和Docker下载卡住",
    "type": "问题记录",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "Linux入门/问题记录",
    "categoryPath": [
      "Linux入门",
      "问题记录"
    ],
    "tags": [
      "问题记录"
    ],
    "summary": "在 WSL2 Ubuntu 26.04 里安装 Docker 时， sudo apt update 出现 Waiting for headers ，Docker 拉取 hello world 镜像时出现 TLS ha",
    "source": "Linux入门\\问题记录\\WSL代理-apt和Docker下载卡住.md",
    "body": "## 问题是什么\n\n在 WSL2 Ubuntu 26.04 里安装 Docker 时，`sudo apt update` 出现 `Waiting for headers`，Docker 拉取 `hello-world` 镜像时出现 `TLS handshake timeout`。同时 Windows 浏览器可以访问 Google/YouTube，容易误以为 Linux 终端也应该自动可用。\n\n## 用了什么知识点\n\nWSL 和 Windows 浏览器不是同一个网络上下文。浏览器能走 Windows 系统代理，不代表 WSL 里的 `apt`、`curl`、Docker daemon 自动走同一个代理。\n\n本质理解：`apt` 下载软件包、普通 shell 命令访问网络、Docker daemon 拉镜像，是三类不同的网络请求，代理配置可以互不相同。\n\n## 怎么解决\n\n先确认系统：\n\n```bash\nuname -a\ncat /etc/os-release\n```\n\n确认是 WSL2 Ubuntu 26.04 后，发现开 VPN 时 `apt update` 卡住，关闭 VPN 后 Ubuntu 源恢复正常。后来需要通过 Clash Verge 代理加速安装，关键是测试可用代理地址：\n\n```bash\ncurl -x http://127.0.0.1:7897 -I https://www.google.com\n```\n\n成功后，用代理安装 Ubuntu 仓库里的 Docker 包：\n\n```bash\nsudo env http_proxy=http://127.0.0.1:7897 https_proxy=http://127.0.0.1:7897 apt install -y docker.io docker-compose-v2\n```\n\nDocker 拉镜像失败时，需要给 Docker daemon 单独配置代理：\n\n```bash\nsudo mkdir -p /etc/systemd/system/docker.service.d\nsudo nano /etc/systemd/system/docker.service.d/http-proxy.conf\n```\n\n写入：\n\n```ini\n[Service]\nEnvironment=\"HTTP_PROXY=http://127.0.0.1:7897\"\nEnvironment=\"HTTPS_PROXY=http://127.0.0.1:7897\"\nEnvironment=\"NO_PROXY=localhost,127.0.0.1\"\n```\n\n重启 Docker：\n\n```bash\nsudo systemctl daemon-reload\nsudo systemctl restart docker\nsudo systemctl show --property=Environment docker\n```\n\n## 解决了什么问题\n\n解决了两个层面的网络问题：`apt` 能安装 Docker 软件包，Docker daemon 也能从 Docker Hub 拉取镜像。\n\n## 易错点\n\n不要认为“浏览器能上网”就等于 WSL 里所有命令都能上网。`http_proxy`/`https_proxy` 只对当前命令或进程有效，不会自动影响 Docker daemon。Clash Verge 中 `172.29.0.2:7897` 测试失败，但 `127.0.0.1:7897` 成功，所以当前环境优先使用 `127.0.0.1:7897`。\n\n## 验证方式\n\n普通代理验证：\n\n```bash\ncurl -x http://127.0.0.1:7897 -I https://www.google.com\n```\n\nDocker daemon 验证：\n\n```bash\nsudo docker run hello-world\n```\n\n期望看到：\n\n```text\nHello from Docker!\n```\n\n## 下一步\n\n学习 Docker 端口映射，用 nginx 容器理解 `-p 8080:80`。"
  },
  {
    "slug": "python后端-docker-01-docker第一天-docker安装与hello-world验证-wsl",
    "title": "Docker安装与hello world验证 WSL",
    "type": "Docker",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/Docker",
    "categoryPath": [
      "PYTHON后端",
      "Docker"
    ],
    "tags": [
      "Docker"
    ],
    "summary": "Docker 第一天的目标不是先写 Dockerfile，而是先确认 Linux/WSL 环境里 Docker 能真正运行容器。用户环境是 WSL2 Ubuntu 26.04，最初 docker version 提示",
    "source": "PYTHON后端\\Docker\\01-Docker第一天\\Docker安装与hello-world验证-WSL.md",
    "body": "## 问题是什么\n\nDocker 第一天的目标不是先写 Dockerfile，而是先确认 Linux/WSL 环境里 Docker 能真正运行容器。用户环境是 WSL2 Ubuntu 26.04，最初 `docker --version` 提示 `Command 'docker' not found`。\n\n## 用了什么知识点\n\nDocker 的最小运行链路是：Docker client 调用 Docker daemon，daemon 拉取 image，然后基于 image 创建并运行 container。\n\n本质理解：镜像是模板，容器是模板跑起来后的实例，daemon 是真正负责拉镜像和创建容器的后台服务。\n\n## 怎么解决\n\n安装路径选择：Docker 官方 apt 源不稳定时，先使用 Ubuntu 仓库包完成学习环境：\n\n```bash\nsudo env http_proxy=http://127.0.0.1:7897 https_proxy=http://127.0.0.1:7897 apt install -y docker.io docker-compose-v2\n```\n\n检查 Docker 服务：\n\n```bash\nsudo service docker status\n```\n\n如果需要启动：\n\n```bash\nsudo service docker start\n```\n\n验证容器运行：\n\n```bash\nsudo docker run hello-world\n```\n\n成功输出包括：\n\n```text\nHello from Docker!\n```\n\n## 解决了什么问题\n\n确认了 Docker 已经安装成功、Docker 服务正在运行、Docker daemon 可以拉取镜像并启动容器。\n\n## 易错点\n\n`docker --version` 只能说明 Docker CLI 存在，不等于 daemon 正常。`sudo service docker status` 看到 `active (running)` 才说明服务在运行。`hello-world` 本地没有镜像时会先拉取，这是正常现象；如果出现 `TLS handshake timeout`，通常是 Docker daemon 没有配置代理。\n\n## 验证方式\n\n```bash\ndocker --version\ndocker compose version\nsudo service docker status\nsudo docker run hello-world\n```\n\n期望结果：Docker 服务状态是 `active (running)`，`hello-world` 输出 `Hello from Docker!`。\n\n## 下一步\n\n运行 nginx 容器，学习端口映射 `-p 8080:80`。"
  },
  {
    "slug": "python后端-fastapi-请求响应模型-patch-tasks-task-id-局部更新任务",
    "title": "PATCH /tasks/{task id} 局部更新任务",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/请求响应模型",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "请求响应模型"
    ],
    "tags": [
      "FASTAPI",
      "请求响应模型"
    ],
    "summary": "PUT 更新任务时通常要求前端提交完整任务数据，例如 title 、 description 、 done 都要传。实际开发中，经常只想修改一个字段，例如只把 done 改成 true ，这时继续使用 PUT 会显得",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\PATCH-tasks-task_id-局部更新任务.md",
    "body": "## 问题是什么\n\n`PUT` 更新任务时通常要求前端提交完整任务数据，例如 `title`、`description`、`done` 都要传。实际开发中，经常只想修改一个字段，例如只把 `done` 改成 `true`，这时继续使用 `PUT` 会显得繁琐。\n\n## 用了什么知识点\n\n- `PATCH`：表示局部更新资源。\n- `TaskUpdate`：专门给局部更新使用的请求模型。\n- 可选字段：`str | None = None`、`bool | None = None`。\n- `model_dump(exclude_unset=True)`：只取用户实际传入的字段。\n- `setattr()`：根据字段名动态修改 ORM 对象属性。\n\n## 怎么解决\n\n在 `schemas.py` 中新增局部更新模型：\n\n```python\nclass TaskUpdate(BaseModel):\n    title: str | None = None\n    description: str | None = None\n    done: bool | None = None\n```\n\n在 `main.py` 中新增 `PATCH` 接口：\n\n```python\n@app.patch(\"/tasks/{task_id}\", response_model=schemas.TaskRead)\ndef patch_task(\n    task_id: int,\n    updated_task: schemas.TaskUpdate,\n    db: Session = Depends(get_db)\n):\n    task = db.query(models.TaskModel).filter(\n        models.TaskModel.id == task_id\n    ).first()\n\n    if task is None:\n        raise HTTPException(status_code=404, detail=\"任务不存在\")\n\n    update_data = updated_task.model_dump(exclude_unset=True)\n\n    for key, value in update_data.items():\n        setattr(task, key, value)\n\n    db.commit()\n    db.refresh(task)\n\n    return task\n```\n\n## 解决了什么问题\n\n现在前端可以只提交要修改的字段，不需要每次更新任务都传完整数据。比如只修改完成状态时，只需要传：\n\n```json\n{\n  \"done\": true\n}\n```\n\n## 易错点\n\n- 不要直接把所有字段都写回数据库，否则没传的字段可能会变成 `None`。\n- 关键是使用 `model_dump(exclude_unset=True)`，只保留用户真正传入的字段。\n- `PUT` 和 `PATCH` 不要混淆：`PUT` 更偏完整更新，`PATCH` 更偏局部更新。\n- `TaskUpdate` 的字段要设置为可选，否则前端仍然必须传完整数据。\n\n## 验证方式\n\n启动服务后打开：\n\n```text\nhttp://127.0.0.1:8000/docs\n```\n\n测试 `PATCH /tasks/{task_id}`，只提交一个字段：\n\n```json\n{\n  \"done\": true\n}\n```\n\n预期结果：接口返回完整任务对象，并且只有 `done` 被更新，其他字段保持原值。\n\n## 下一步\n\n下一步学习 `APIRouter`，把所有接口从 `main.py` 中拆出去，让项目结构接近真实开发项目。"
  },
  {
    "slug": "python后端-fastapi-请求响应模型-response-model-完整规范所有接口",
    "title": "response_model 完整规范所有接口",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/请求响应模型",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "请求响应模型"
    ],
    "tags": [
      "FASTAPI",
      "请求响应模型"
    ],
    "summary": "接口虽然已经能返回数据，但 PUT 和 DELETE 如果不声明 response model ，返回结构就不够明确。这样会让自动文档不清楚，前端也不容易判断接口到底会返回哪些字段。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\response_model-完整规范所有接口.md",
    "body": "## 问题是什么\n\n接口虽然已经能返回数据，但 `PUT` 和 `DELETE` 如果不声明 `response_model`，返回结构就不够明确。这样会让自动文档不清楚，前端也不容易判断接口到底会返回哪些字段。\n\n## 用了什么知识点\n\n- `response_model`：声明接口响应数据结构。\n- `TaskRead`：任务对象的响应模型，包含数据库生成的 `id`。\n- `MessageResponse`：只返回消息时使用的响应模型。\n- Pydantic schema：用模型约束接口输入和输出。\n\n## 怎么解决\n\n在 `schemas.py` 中保留任务响应模型：\n\n```python\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    description: str\n    done: bool\n\n    model_config = ConfigDict(from_attributes=True)\n```\n\n新增删除接口使用的消息响应模型：\n\n```python\nclass MessageResponse(BaseModel):\n    message: str\n```\n\n给所有接口补齐响应模型：\n\n```python\n@app.get(\"/tasks\", response_model=list[schemas.TaskRead])\n@app.get(\"/tasks/{task_id}\", response_model=schemas.TaskRead)\n@app.post(\"/tasks\", response_model=schemas.TaskRead)\n@app.put(\"/tasks/{task_id}\", response_model=schemas.TaskRead)\n@app.delete(\"/tasks/{task_id}\", response_model=schemas.MessageResponse)\n```\n\n## 解决了什么问题\n\n现在每个接口返回什么结构都很清楚：查询、新增、更新返回任务对象；删除返回消息对象。FastAPI 文档也会自动展示准确的响应结构。\n\n## 易错点\n\n- 不要把 `TaskCreate` 当响应模型，它是请求模型，不包含数据库生成的 `id`。\n- `DELETE` 不适合返回 `TaskRead`，因为任务已经被删除了。\n- 如果返回 ORM 对象，需要在响应模型中开启 `from_attributes=True`。\n- 写类型注解时要注意 `schemas` 拼写，拼错会引发 Pydantic / ForwardRef 相关错误。\n\n## 验证方式\n\n启动 FastAPI 后打开：\n\n```text\nhttp://127.0.0.1:8000/docs\n```\n\n检查接口文档中：\n\n- `GET /tasks` 返回 `array of TaskRead`\n- `GET /tasks/{task_id}` 返回 `TaskRead`\n- `POST /tasks` 返回 `TaskRead`\n- `PUT /tasks/{task_id}` 返回 `TaskRead`\n- `DELETE /tasks/{task_id}` 返回 `MessageResponse`\n\n也可以实际请求 `DELETE /tasks/{task_id}`，确认返回：\n\n```json\n{\n  \"message\": \"任务删除成功\"\n}\n```\n\n## 下一步\n\n下一步学习 `PATCH` 局部更新，理解它和 `PUT` 的区别：`PUT` 通常要求提交完整任务数据，`PATCH` 只提交要修改的字段。"
  },
  {
    "slug": "python后端-fastapi-请求响应模型-schemas-拼写错误导致forwardref报错",
    "title": "schemas 拼写错误导致 ForwardRef 报错",
    "type": "问题记录",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/请求响应模型",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "请求响应模型"
    ],
    "tags": [
      "FASTAPI",
      "请求响应模型"
    ],
    "summary": "访问 /docs 时 FastAPI 生成 OpenAPI 文档失败，报出 PydanticUserError，并提示 ForwardRef('shcemas.TaskCreate') 没有完整定义。问题出现在接口参",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\schemas-拼写错误导致ForwardRef报错.md",
    "body": "## 问题是什么\n\n访问 `/docs` 时 FastAPI 生成 OpenAPI 文档失败，报出 PydanticUserError，并提示 `ForwardRef('shcemas.TaskCreate')` 没有完整定义。问题出现在接口参数类型注解里引用了不存在的模块名。\n\n## 用了什么知识点\n\n- Python 类型注解。\n- FastAPI 根据类型注解生成 OpenAPI 文档。\n- Pydantic v2 的模型解析和 JSON Schema 生成。\n- ForwardRef：字符串形式或延迟解析的类型引用。\n- 请求模型模块命名：`schemas`。\n\n## 怎么解决\n\n检查报错中的关键线索：\n\n```text\nForwardRef('shcemas.TaskCreate')\nowner=<function update_task ...>\nalias='updated_task'\n```\n\n说明 `update_task` 函数里的 `updated_task` 参数类型写错了。\n\n错误写法：\n\n```python\ndef update_task(\n    task_id: int,\n    updated_task: shcemas.TaskCreate,\n    db: Session = Depends(get_db)\n):\n    ...\n```\n\n正确写法：\n\n```python\nimport schemas\n\ndef update_task(\n    task_id: int,\n    updated_task: schemas.TaskCreate,\n    db: Session = Depends(get_db)\n):\n    ...\n```\n\n## 解决了什么问题\n\n修正拼写后，FastAPI 能正确找到 `schemas.TaskCreate`，Pydantic 可以正常生成请求体 schema，`/docs` 也能恢复显示。\n\n## 易错点\n\n- `schemas` 很容易拼成 `shcemas`。\n- 这类错误不一定在启动服务时立刻暴露，可能在访问 `/docs` 生成 OpenAPI 时才爆出来。\n- 报错很长时要抓关键词：`ForwardRef`、函数名、参数名、拼错的类型名。\n- 这不是数据库错误，也不是 `response_model` 本身的问题。\n\n## 验证方式\n\n- 修正 `shcemas.TaskCreate` 为 `schemas.TaskCreate`。\n- 确认文件顶部有 `import schemas`。\n- 重启服务或等待 reload。\n- 打开 `/docs`，如果文档正常展示，说明类型引用恢复正常。\n\n## 下一步\n\n继续把 `response_model` 完整应用到所有接口，并为 `DELETE` 接口设计一个清晰的返回结构。"
  },
  {
    "slug": "python后端-fastapi-请求响应模型-schemaspy-拆分请求模型",
    "title": "schemas.py 拆分请求模型",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/请求响应模型",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "请求响应模型"
    ],
    "tags": [
      "FASTAPI",
      "请求响应模型"
    ],
    "summary": "数据库版 CRUD 完成后， main.py 里开始混合 FastAPI app、数据库依赖、接口函数和 Pydantic 模型。代码继续变大时，所有内容堆在 main.py 会难以维护。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\schemas.py-拆分请求模型.md",
    "body": "## 问题是什么\n\n数据库版 CRUD 完成后，`main.py` 里开始混合 FastAPI app、数据库依赖、接口函数和 Pydantic 模型。代码继续变大时，所有内容堆在 `main.py` 会难以维护。\n\n## 用了什么知识点\n\n- Pydantic `BaseModel`。\n- 请求体模型。\n- FastAPI 项目分层。\n- `schemas.py` 用于存放请求/响应数据结构。\n- `models.py` 和 `schemas.py` 的职责区分。\n\n## 怎么解决\n\n新建 `schemas.py`，把请求体模型从 `main.py` 中拆出去。\n\n```python\nfrom pydantic import BaseModel\n\nclass TaskCreate(BaseModel):\n    title: str\n    description: str\n    done: bool = False\n```\n\n然后在 `main.py` 中导入：\n\n```python\nimport schemas\n```\n\n把接口参数从原来的：\n\n```python\ntask: Task\nupdated_task: Task\n```\n\n改成：\n\n```python\ntask: schemas.TaskCreate\nupdated_task: schemas.TaskCreate\n```\n\n## 解决了什么问题\n\n`main.py` 不再负责定义请求体结构，接口逻辑和数据结构开始分离。项目从“能跑”继续向“结构清晰的小型后端项目”靠近。\n\n## 易错点\n\n- `models.TaskModel` 是数据库表模型，负责和数据库表对应。\n- `schemas.TaskCreate` 是请求体模型，负责校验客户端传来的 JSON。\n- `TaskCreate` 不应该包含数据库自动生成的 `id`。\n- 拆出 `schemas.py` 后，要记得删除或停止使用 `main.py` 里原来的 `Task` 类。\n\n## 验证方式\n\n- 启动服务。\n- 打开 `/docs`。\n- 执行 `POST /tasks` 和 `PUT /tasks/{task_id}`。\n- 如果请求体结构仍然正常展示，并且接口能正常新增/更新任务，说明请求模型拆分成功。\n\n## 下一步\n\n继续完善 `schemas.py`，加入 `TaskRead` 响应模型，并用 `response_model` 控制接口返回结构。"
  },
  {
    "slug": "python后端-fastapi-请求响应模型-schemaspy-添加响应模型",
    "title": "schemas.py 添加响应模型",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/请求响应模型",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "请求响应模型"
    ],
    "tags": [
      "FASTAPI",
      "请求响应模型"
    ],
    "summary": "TaskCreate 只描述客户端提交的数据，但接口返回给客户端的数据也需要明确结构。数据库返回的是 SQLAlchemy ORM 对象，如果不声明响应模型，接口返回会不够规范，也不方便控制哪些字段应该暴露。",
    "source": "PYTHON后端\\FASTAPI\\请求响应模型\\schemas.py-添加响应模型.md",
    "body": "## 问题是什么\n\n`TaskCreate` 只描述客户端提交的数据，但接口返回给客户端的数据也需要明确结构。数据库返回的是 SQLAlchemy ORM 对象，如果不声明响应模型，接口返回会不够规范，也不方便控制哪些字段应该暴露。\n\n## 用了什么知识点\n\n- Pydantic 响应模型。\n- FastAPI `response_model`。\n- 请求模型和响应模型分离。\n- SQLAlchemy ORM 对象转 Pydantic 模型。\n- `orm_mode = True`：Pydantic v1 中允许从 ORM 对象读取字段。\n\n## 怎么解决\n\n在 `schemas.py` 中保留 `TaskCreate`，再新增 `TaskRead`。\n\n```python\nfrom pydantic import BaseModel\n\nclass TaskCreate(BaseModel):\n    title: str\n    description: str\n    done: bool = False\n\nclass TaskRead(BaseModel):\n    id: int\n    title: str\n    description: str\n    done: bool\n\n    class Config:\n        orm_mode = True\n```\n\n然后在接口上声明 `response_model`。\n\n```python\n@app.get(\"/tasks\", response_model=list[schemas.TaskRead])\ndef get_tasks(db: Session = Depends(get_db)):\n    return db.query(models.TaskModel).all()\n\n@app.get(\"/tasks/{task_id}\", response_model=schemas.TaskRead)\ndef get_task(task_id: int, db: Session = Depends(get_db)):\n    ...\n\n@app.post(\"/tasks\", response_model=schemas.TaskRead)\ndef create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):\n    ...\n```\n\n## 解决了什么问题\n\n接口请求结构和响应结构分开管理。客户端创建任务时不用传 `id`，但服务器返回任务时会包含数据库生成的 `id`，接口文档也更清晰。\n\n## 易错点\n\n- `TaskCreate` 不包含 `id`，因为 `id` 由数据库生成。\n- `TaskRead` 包含 `id`，因为响应给客户端时需要展示任务唯一标识。\n- 接口返回 SQLAlchemy ORM 对象时，Pydantic v1 需要 `orm_mode = True`。\n- `response_model=list[schemas.TaskRead]` 用于返回列表，`response_model=schemas.TaskRead` 用于返回单个对象。\n\n## 验证方式\n\n- 启动服务并打开 `/docs`。\n- 查看 `GET /tasks` 的响应结构是否显示为任务列表。\n- 查看 `POST /tasks` 的请求体不要求 `id`，响应体包含 `id`。\n- 执行新增和查询接口，确认返回字段符合 `TaskRead`。\n\n## 下一步\n\n确认当前项目使用的是 Pydantic v1 还是 v2，因为 `orm_mode = True` 在 Pydantic v2 中需要换成新的 `from_attributes` 写法。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-delete-tasks-task-id-删除数据库任务",
    "title": "DELETE /tasks/{task id} 删除数据库任务",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "数据库版 GET 、 POST 、 PUT 已经完成，但删除任务仍需要从内存列表写法切换为数据库写法。否则任务删除不会真正作用于 SQLite 数据库。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\DELETE-tasks-task_id-删除数据库任务.md",
    "body": "## 问题是什么\n\n数据库版 `GET`、`POST`、`PUT` 已经完成，但删除任务仍需要从内存列表写法切换为数据库写法。否则任务删除不会真正作用于 SQLite 数据库。\n\n## 用了什么知识点\n\n- FastAPI `DELETE` 接口用于删除资源。\n- 路径参数：`task_id: int`。\n- `Depends(get_db)` 获取数据库会话。\n- SQLAlchemy `filter().first()` 查询待删除记录。\n- `db.delete()` 标记删除 ORM 对象。\n- `db.commit()` 提交删除事务。\n- `HTTPException(status_code=404)` 处理任务不存在。\n\n## 怎么解决\n\n先根据 `task_id` 查询任务是否存在。存在则删除并提交；不存在则返回 404。\n\n```python\n@app.delete(\"/tasks/{task_id}\")\ndef delete_task(task_id: int, db: Session = Depends(get_db)):\n    task = db.query(models.TaskModel).filter(\n        models.TaskModel.id == task_id\n    ).first()\n\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"任务不存在\"\n        )\n\n    db.delete(task)\n    db.commit()\n\n    return {\"message\": \"任务删除成功\"}\n```\n\n## 解决了什么问题\n\n`DELETE /tasks/{task_id}` 可以真正删除数据库中的任务记录。至此，数据库版 `GET`、`POST`、`PUT`、`DELETE` 全部完成，任务管理 API 具备完整数据库 CRUD 能力。\n\n## 易错点\n\n- `db.delete(task)` 只是标记删除，必须 `db.commit()` 才会真正写入数据库。\n- 删除前必须先查任务是否存在。\n- 找不到任务要返回 404，而不是假装删除成功。\n- 删除成功后再查询同一个 id，应该返回 404。\n\n## 验证方式\n\n- 先用 `POST /tasks` 新增一条任务。\n- 记住返回的 `id`。\n- 执行 `DELETE /tasks/{id}`。\n- 再执行 `GET /tasks/{id}`。\n- 如果返回 404，说明任务已从数据库删除。\n\n## 下一步\n\n把 Pydantic 请求/响应模型拆到 `schemas.py`，让 `main.py` 只负责接口逻辑，项目结构更清晰。"
  },
  {
    "slug": "python后端-fastapi-logic",
    "title": "LOGIC",
    "type": "FastAPI",
    "date": "2026-06-04",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI"
    ],
    "tags": [
      "FASTAPI"
    ],
    "summary": "请求进来 schemas检查数据格式 创建数据库会话拿权限资源 ORM CRUD库 响应返回信息",
    "source": "PYTHON后端\\FASTAPI\\LOGIC.md",
    "body": "请求进来 -- schemas检查数据格式 -- 创建数据库会话拿权限资源 -- ORM CRUD库 -- 响应返回信息"
  },
  {
    "slug": "python后端-fastapi-数据库接入-databasepy-数据库连接配置",
    "title": "database.py 数据库连接配置",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "项目准备从内存列表切换到数据库存储，但在写数据库表模型和 CRUD 之前，需要先有一个统一的数据库连接入口。否则后续每个接口都会重复写连接逻辑，项目结构会越来越乱。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\database.py-数据库连接配置.md",
    "body": "## 问题是什么\n\n项目准备从内存列表切换到数据库存储，但在写数据库表模型和 CRUD 之前，需要先有一个统一的数据库连接入口。否则后续每个接口都会重复写连接逻辑，项目结构会越来越乱。\n\n## 用了什么知识点\n\n- `create_engine()`：创建 SQLAlchemy 数据库引擎。\n- `sessionmaker()`：创建数据库会话工厂。\n- `declarative_base()`：创建 ORM 模型基类。\n- SQLite 连接地址：`sqlite:///./tasks.db`。\n- `connect_args={\"check_same_thread\": False}`：FastAPI 使用 SQLite 时常见的线程检查配置。\n- 模块分层：把数据库基础配置放到 `database.py`，不要继续堆在 `main.py`。\n\n## 怎么解决\n\n创建 `database.py`，集中保存数据库地址、引擎、会话工厂和 ORM 基类。\n\n```python\nfrom sqlalchemy import create_engine\nfrom sqlalchemy.orm import sessionmaker, declarative_base\n\n# SQLite 数据库地址\nDATABASE_URL = \"sqlite:///./tasks.db\"\n\n# 创建数据库引擎\nengine = create_engine(\n    DATABASE_URL,\n    connect_args={\"check_same_thread\": False}\n)\n\n# 创建数据库会话 -- 每次请求数据库操作上下文\nSessionLocal = sessionmaker(\n    autocommit=False,\n    autoflush=False,\n    bind=engine\n)\n\n# ORM 基类\nBase = declarative_base()\n```\n\n## 解决了什么问题\n\n项目有了稳定的数据库基础层。后续 `models.py` 可以继承 `Base` 定义数据表，接口层可以通过 `SessionLocal` 创建数据库会话，不需要在每个接口里重新配置数据库连接。\n\n## 易错点\n\n- `SessionLocal` 是会话工厂，不是数据库连接结果本身。\n- `Base` 是 ORM 模型的基类，不代表具体的数据表。\n- `autocommit=False` 表示数据库修改后通常需要显式提交。\n- `autoflush=False` 可以先避免 SQLAlchemy 自动刷新带来的理解负担。\n- SQLite 的连接字符串是 `sqlite:///./tasks.db`，斜杠数量不要写错。\n\n## 验证方式\n\n- 确认项目根目录存在 `database.py`。\n- 确认文件中能正常导入 `engine`、`SessionLocal`、`Base`。\n- 下一步创建模型并执行建表后，项目目录中应生成 `tasks.db`。\n\n## 下一步\n\n创建 `models.py`，定义任务表对应的 ORM 模型类，让 Python 类真正映射到数据库表。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-get-db-数据库会话依赖",
    "title": "get db 数据库会话依赖",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "数据库和表已经能创建，但接口函数还不能直接操作数据库。每次请求都需要一个数据库会话，并且请求结束后要关闭会话，否则连接管理会混乱。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\get_db-数据库会话依赖.md",
    "body": "## 问题是什么\n\n数据库和表已经能创建，但接口函数还不能直接操作数据库。每次请求都需要一个数据库会话，并且请求结束后要关闭会话，否则连接管理会混乱。\n\n## 用了什么知识点\n\n- `SessionLocal`：数据库会话工厂。\n- SQLAlchemy `Session`：数据库操作上下文。\n- FastAPI 依赖注入。\n- `yield` 依赖：请求前创建资源，请求后清理资源。\n- `try/finally`：保证接口执行结束后关闭数据库会话。\n\n## 怎么解决\n\n在 `main.py` 中创建 `get_db()` 函数。\n\n```python\nfrom sqlalchemy.orm import Session\nfrom database import SessionLocal\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n```\n\n## 解决了什么问题\n\n每个接口都可以通过依赖注入拿到一次请求范围内的数据库会话。接口执行完后，数据库会话会被自动关闭，避免连接泄漏。\n\n## 易错点\n\n- 这里用 `yield db`，不是 `return db`。\n- `finally: db.close()` 不要漏掉，否则会话不会被及时释放。\n- `SessionLocal()` 是创建会话，不是执行查询。\n- `get_db()` 本身不会操作数据库，只负责把数据库会话交给接口。\n\n## 验证方式\n\n- 确认 `main.py` 能导入 `SessionLocal`。\n- 确认 `get_db()` 写在接口函数之前。\n- 下一步在接口里使用 `Depends(get_db)`，如果服务能启动，说明依赖函数基本可用。\n\n## 下一步\n\n在接口函数中使用 `Depends(get_db)` 接收数据库会话，然后把 `GET /tasks` 改成从数据库查询任务。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-get-tasks-查询数据库任务",
    "title": "GET /tasks 查询数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "接口已经能拿到数据库会话，但 GET /tasks 仍然可能在读取内存列表 tasks [] 。这样即使数据库表已经创建，查询接口也没有真正使用数据库。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\GET-tasks-查询数据库任务.md",
    "body": "## 问题是什么\n\n接口已经能拿到数据库会话，但 `GET /tasks` 仍然可能在读取内存列表 `tasks = []`。这样即使数据库表已经创建，查询接口也没有真正使用数据库。\n\n## 用了什么知识点\n\n- FastAPI `Depends(get_db)` 依赖注入。\n- SQLAlchemy `Session` 数据库会话。\n- `db.query(models.TaskModel)` 查询 ORM 模型对应的数据表。\n- `.all()` 获取全部查询结果。\n- 从内存数据切换到数据库数据。\n\n## 怎么解决\n\n给接口函数添加数据库会话参数，并用 SQLAlchemy 查询 `TaskModel`。\n\n```python\nfrom fastapi import Depends\nfrom sqlalchemy.orm import Session\n\n@app.get(\"/tasks\")\ndef get_tasks(db: Session = Depends(get_db)):\n    return db.query(models.TaskModel).all()\n```\n\n核心语句：\n\n```python\ndb.query(models.TaskModel).all()\n```\n\n## 解决了什么问题\n\n`GET /tasks` 不再依赖内存列表，而是开始读取 SQLite 数据库中的 `tasks` 表。项目的数据来源从临时内存转向持久化数据库。\n\n## 易错点\n\n- `Depends(get_db)` 不要写成直接调用 `get_db()`。\n- `models.TaskModel` 指的是 ORM 模型类，不是 Pydantic 请求模型。\n- `.all()` 返回列表，即使数据库为空也会返回 `[]`。\n- 数据库里还没有任务时，看到空列表是正常现象。\n\n## 验证方式\n\n- 启动服务。\n- 打开 `/docs`。\n- 执行 `GET /tasks`。\n- 如果返回 `[]`，说明接口已经能正常查询数据库，只是当前还没有数据。\n\n## 下一步\n\n把 `POST /tasks` 改成真正向数据库插入任务记录。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-get-tasks-task-id-查询单个数据库任务",
    "title": "GET /tasks/{task id} 查询单个数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "GET /tasks 已经能查询数据库中的全部任务，但真实 API 还需要根据 id 查询单个任务。如果继续遍历内存列表，就没有真正使用数据库，也不能和数据库新增的数据保持一致。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\GET-tasks-task_id-查询单个数据库任务.md",
    "body": "## 问题是什么\n\n`GET /tasks` 已经能查询数据库中的全部任务，但真实 API 还需要根据 id 查询单个任务。如果继续遍历内存列表，就没有真正使用数据库，也不能和数据库新增的数据保持一致。\n\n## 用了什么知识点\n\n- 路径参数：`task_id: int`。\n- `Depends(get_db)` 获取数据库会话。\n- SQLAlchemy `filter()` 添加查询条件。\n- `models.TaskModel.id == task_id` 表示筛选指定 id。\n- `.first()` 获取第一条匹配结果。\n- `HTTPException(status_code=404)` 处理资源不存在。\n\n## 怎么解决\n\n把原来的内存遍历查询改成数据库条件查询。\n\n```python\n@app.get(\"/tasks/{task_id}\")\ndef get_task(task_id: int, db: Session = Depends(get_db)):\n    task = db.query(models.TaskModel).filter(\n        models.TaskModel.id == task_id\n    ).first()\n\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"任务不存在\"\n        )\n\n    return task\n```\n\n核心查询：\n\n```python\ndb.query(models.TaskModel).filter(\n    models.TaskModel.id == task_id\n).first()\n```\n\n## 解决了什么问题\n\n接口可以根据任务 id 从数据库中查询单条任务。数据库新增后的任务，现在既能通过 `GET /tasks` 查询全部，也能通过 `GET /tasks/{task_id}` 精确查询单个。\n\n## 易错点\n\n- `.first()` 找不到数据时返回 `None`，不是空列表。\n- `models.TaskModel.id == task_id` 是 SQLAlchemy 查询条件，不是普通赋值。\n- 找不到任务时要返回 404，不能直接返回 `None`。\n- `task_id` 来自 URL 路径，不来自请求体。\n\n## 验证方式\n\n- 先用 `POST /tasks` 新增一条任务。\n- 记住返回结果里的 `id`。\n- 执行 `GET /tasks/{id}`。\n- 如果 id 存在，应返回单个任务；如果 id 不存在，应返回 404。\n\n## 下一步\n\n把 `PUT /tasks/{task_id}` 改成数据库更新，让修改任务也能持久化保存。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-mainpy-自动创建数据库表",
    "title": "main.py 自动创建数据库表",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "已经定义了 database.py 和 models.py ，但数据库表还没有真正创建出来。仅仅写好 ORM 模型类，不等于 SQLite 数据库里已经有 tasks 表。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\main.py-自动创建数据库表.md",
    "body": "## 问题是什么\n\n已经定义了 `database.py` 和 `models.py`，但数据库表还没有真正创建出来。仅仅写好 ORM 模型类，不等于 SQLite 数据库里已经有 `tasks` 表。\n\n## 用了什么知识点\n\n- `import models`：让 SQLAlchemy 读取已经定义的 ORM 模型。\n- `engine`：数据库连接引擎。\n- `Base.metadata`：SQLAlchemy 收集到的所有表结构元数据。\n- `create_all(bind=engine)`：根据 ORM 模型自动创建数据库表。\n- FastAPI 启动阶段执行初始化逻辑。\n\n## 怎么解决\n\n在 `main.py` 中导入 `models` 和 `engine`，然后调用建表方法。\n\n```python\nfrom fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\nimport models\nfrom database import engine\n\napp = FastAPI()\n\nmodels.Base.metadata.create_all(bind=engine)\n```\n\n核心语句：\n\n```python\nmodels.Base.metadata.create_all(bind=engine)\n```\n\n它会读取所有继承 `Base` 的 ORM 模型，并通过 `engine` 在 SQLite 中创建对应的数据表。\n\n## 解决了什么问题\n\n项目从“只定义了表结构”进入到“数据库中真的可以生成表”。运行服务后，项目目录中会出现 `tasks.db`，后续接口就可以围绕真实数据库表进行增删改查。\n\n## 易错点\n\n- 必须 `import models`，否则 SQLAlchemy 可能不知道 `TaskModel` 已存在。\n- `create_all()` 只会创建不存在的表，不适合后期复杂数据库迁移。\n- `bind=engine` 不能漏掉，否则不知道连接哪个数据库。\n- 这一步只是建表，还没有把接口从 `tasks = []` 改成数据库操作。\n\n## 验证方式\n\n- 运行 `uvicorn main:app --reload`。\n- 查看项目目录是否出现 `tasks.db`。\n- 后续可以通过数据库工具或 SQLAlchemy 查询确认存在 `tasks` 表。\n\n## 下一步\n\n创建数据库会话依赖 `get_db()`，让每个接口函数都能拿到一次请求范围内的数据库会话。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-modelspy-定义任务表模型",
    "title": "models.py 定义任务表模型",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "已经有了 database.py 的数据库连接配置，但数据库里还没有真正的任务表。后端需要告诉 SQLAlchemy：任务表叫什么、有哪些字段、每个字段是什么类型。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\models.py-定义任务表模型.md",
    "body": "## 问题是什么\n\n已经有了 `database.py` 的数据库连接配置，但数据库里还没有真正的任务表。后端需要告诉 SQLAlchemy：任务表叫什么、有哪些字段、每个字段是什么类型。\n\n## 用了什么知识点\n\n- ORM Model：用 Python 类映射数据库表。\n- `Base`：所有 ORM 模型类的基类。\n- `Column`：定义数据库表中的列。\n- `Integer`、`String`、`Boolean`：SQLAlchemy 字段类型。\n- `primary_key=True`：主键，唯一标识一条记录。\n- `index=True`：索引，方便后续查询。\n- `default=False`：字段默认值。\n\n## 怎么解决\n\n创建 `models.py`，定义 `TaskModel` 类，并继承 `database.py` 中的 `Base`。\n\n```python\nfrom sqlalchemy import Column, Integer, String, Boolean\n\nfrom database import Base\n\nclass TaskModel(Base):\n    __tablename__ = \"tasks\"\n\n    id = Column(Integer, primary_key=True, index=True)\n    title = Column(String, index=True)\n    description = Column(String)\n    done = Column(Boolean, default=False)\n```\n\n## 解决了什么问题\n\n项目第一次拥有了“数据库表结构”的定义。`TaskModel` 不只是普通 Python 类，它描述了数据库中的 `tasks` 表，为后续自动建表和数据库 CRUD 做准备。\n\n## 易错点\n\n- `TaskModel` 必须继承 `Base`，否则 SQLAlchemy 不会把它当成 ORM 表模型。\n- `__tablename__` 前后都是双下划线，不要写成 `_tablename_`。\n- `Column(String)` 里的 `String` 是 SQLAlchemy 类型，不是 Python 原生 `str`。\n- `id` 要设置 `primary_key=True`，否则数据库不知道哪一列唯一标识任务。\n- 定义模型并不会立刻创建数据库表，还需要下一步调用 `Base.metadata.create_all()`。\n\n## 验证方式\n\n- 确认项目根目录存在 `models.py`。\n- 确认 `models.py` 可以导入 `Base`。\n- 下一步在 `main.py` 中导入 `models` 并执行建表逻辑后，数据库中应出现 `tasks` 表。\n\n## 下一步\n\n在 `main.py` 中导入 `models` 和 `engine`，调用 `Base.metadata.create_all(bind=engine)`，让 SQLAlchemy 根据 `TaskModel` 自动创建数据库表。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-post-tasks-新增数据库任务",
    "title": "POST /tasks 新增数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "GET /tasks 已经能从数据库查询任务，但数据库里还没有新增任务的入口。如果 POST /tasks 仍然把任务追加到内存列表 tasks [] ，新增的数据不会持久保存，服务重启后仍然会丢失。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\POST-tasks-新增数据库任务.md",
    "body": "## 问题是什么\n\n`GET /tasks` 已经能从数据库查询任务，但数据库里还没有新增任务的入口。如果 `POST /tasks` 仍然把任务追加到内存列表 `tasks = []`，新增的数据不会持久保存，服务重启后仍然会丢失。\n\n## 用了什么知识点\n\n- FastAPI `POST` 接口用于创建资源。\n- `Depends(get_db)` 获取数据库会话。\n- SQLAlchemy ORM 对象创建：`models.TaskModel(...)`。\n- `db.add()`：把新对象加入数据库会话。\n- `db.commit()`：提交事务，真正写入数据库。\n- `db.refresh()`：刷新 ORM 对象，拿到数据库生成后的最新字段，例如 `id`。\n\n## 怎么解决\n\n把原来往内存列表 `tasks` 里追加字典的写法，改成创建 `TaskModel` 对象并提交到数据库。\n\n```python\n@app.post(\"/tasks\")\ndef create_task(task: Task, db: Session = Depends(get_db)):\n    db_task = models.TaskModel(\n        title=task.title,\n        description=task.description,\n        done=task.done\n    )\n\n    db.add(db_task)\n    db.commit()\n    db.refresh(db_task)\n\n    return db_task\n```\n\n核心三步：\n\n```python\ndb.add(db_task)\ndb.commit()\ndb.refresh(db_task)\n```\n\n## 解决了什么问题\n\n`POST /tasks` 开始真正把任务写入 SQLite 数据库。新增任务不再只存在内存里，后续再调用 `GET /tasks` 可以从数据库查到刚创建的任务。\n\n## 易错点\n\n- `db.add()` 只是加入会话，还没有真正写入数据库。\n- 必须执行 `db.commit()`，否则数据库不会保存这条任务。\n- `id` 通常由数据库生成，所以提交后要用 `db.refresh(db_task)` 拿到最新对象。\n- `task` 是请求体 Pydantic 模型，`db_task` 是 SQLAlchemy ORM 模型，不要混用。\n- 如果忘记 `db: Session = Depends(get_db)`，接口里就没有数据库会话可用。\n\n## 验证方式\n\n- 打开 `/docs`。\n- 执行 `POST /tasks`，body 示例：\n\n```json\n{\n  \"title\": \"学习数据库新增\",\n  \"description\": \"把任务保存到 SQLite\",\n  \"done\": false\n}\n```\n\n- 再执行 `GET /tasks`。\n- 如果能看到刚刚新增的任务，并且带有数据库生成的 `id`，说明新增成功。\n\n## 下一步\n\n把 `GET /tasks/{task_id}` 改成从数据库查询单个任务，并在查不到时返回 404。"
  },
  {
    "slug": "python后端-fastapi-数据库接入-put-tasks-task-id-更新数据库任务",
    "title": "PUT tasks task_id 更新数据库任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/数据库接入",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "数据库接入"
    ],
    "tags": [
      "FASTAPI",
      "数据库接入"
    ],
    "summary": "任务已经可以写入数据库、查询全部和查询单个，但修改任务仍然需要从内存列表写法切换到数据库写法。否则更新后的任务不会持久保存。",
    "source": "PYTHON后端\\FASTAPI\\数据库接入\\PUT-tasks-task_id-更新数据库任务.md",
    "body": "# PUT /tasks/{task_id} 更新数据库任务\n\n## 问题是什么\n\n任务已经可以写入数据库、查询全部和查询单个，但修改任务仍然需要从内存列表写法切换到数据库写法。否则更新后的任务不会持久保存。\n\n## 用了什么知识点\n\n- FastAPI `PUT` 接口用于更新资源。\n- 路径参数：`task_id: int`。\n- 请求体模型：`updated_task: Task`。\n- `Depends(get_db)` 获取数据库会话。\n- SQLAlchemy `filter().first()` 查询待更新记录。\n- 修改 ORM 对象字段。\n- `db.commit()` 提交更新。\n- `db.refresh()` 刷新更新后的对象。\n- `HTTPException(status_code=404)` 处理任务不存在。\n\n## 怎么解决\n\n先根据 `task_id` 查询数据库中的任务。如果任务不存在，返回 404；如果存在，就修改 ORM 对象字段并提交。\n\n```python\n@app.put(\"/tasks/{task_id}\")\ndef update_task(\n    task_id: int,\n    updated_task: Task,\n    db: Session = Depends(get_db)\n):\n    task = db.query(models.TaskModel).filter(\n        models.TaskModel.id == task_id\n    ).first()\n\n    if task is None:\n        raise HTTPException(\n            status_code=404,\n            detail=\"任务不存在\"\n        )\n\n    task.title = updated_task.title\n    task.description = updated_task.description\n    task.done = updated_task.done\n\n    db.commit()\n    db.refresh(task)\n\n    return task\n```\n\n## 解决了什么问题\n\n`PUT /tasks/{task_id}` 可以真正更新 SQLite 数据库中的任务记录。任务修改后，再通过 `GET /tasks/{task_id}` 查询，会看到持久化后的新内容。\n\n## 易错点\n\n- 不能再使用 `tasks[index] = {...}`，因为现在数据来源已经是数据库。\n- 必须先查询任务是否存在，不能直接创建一个新对象替换。\n- 修改 ORM 对象字段后要执行 `db.commit()`，否则数据库不会保存更新。\n- `db.refresh(task)` 用于拿到数据库提交后的最新对象。\n- 找不到任务时要返回 404，而不是返回空对象。\n\n## 验证方式\n\n- 先用 `POST /tasks` 新增一条任务。\n- 记住返回的 `id`。\n- 执行 `PUT /tasks/{id}`，body 示例：\n\n```json\n{\n  \"title\": \"更新后的任务标题\",\n  \"description\": \"任务已经通过数据库更新\",\n  \"done\": true\n}\n```\n\n- 再执行 `GET /tasks/{id}`。\n- 如果返回内容已变成更新后的字段，说明数据库更新成功。\n\n## 下一步\n\n把 `DELETE /tasks/{task_id}` 改成数据库删除，完成数据库版 CRUD 的最后一步。"
  },
  {
    "slug": "python后端-fastapi-crud接口-delete-tasks-task-id-删除任务",
    "title": "DELETE 删除任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/CRUD接口",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "CRUD接口"
    ],
    "tags": [
      "FASTAPI",
      "CRUD接口"
    ],
    "summary": "任务可以新增、查询、修改后，还需要能删除不再需要的任务。否则任务列表只能越堆越多，CRUD 也不完整。",
    "source": "PYTHON后端\\FASTAPI\\CRUD接口\\DELETE-tasks-task_id-删除任务.md",
    "body": "## 问题是什么\n\n任务可以新增、查询、修改后，还需要能删除不再需要的任务。否则任务列表只能越堆越多，CRUD 也不完整。\n\n## 用了什么知识点\n\n- FastAPI 的 `@app.delete()` 路由。\n- REST API 中 `DELETE` 表示删除资源。\n- 路径参数定位要删除的任务。\n- Python 的 `del` 关键字删除列表指定下标元素。\n- `enumerate()` 找到元素对应下标。\n- 404 异常表示目标资源不存在。\n\n## 怎么解决\n\n在 `main.py` 中新增删除接口，遍历任务列表，找到匹配 id 后删除该下标对应的元素。\n\n```python\n@app.delete(\"/tasks/{task_id}\")\ndef delete_task(task_id: int):\n    for index, task in enumerate(tasks):\n        if task[\"id\"] == task_id:\n            del tasks[index]\n            return {\"message\": \"任务删除成功\"}\n\n    raise HTTPException(status_code=404, detail=\"任务不存在\")\n```\n\n## 解决了什么问题\n\n项目拥有完整的基础 CRUD API：查询全部、查询单个、新增、修改、删除。这个阶段完成后，已经具备初级任务管理后端接口能力。\n\n## 易错点\n\n- 删除前要先确认任务存在。\n- `del tasks[index]` 会直接改变原列表，删除后不要继续依赖旧下标。\n- 删除成功后返回信息即可，不一定需要返回已删除对象。\n- 找不到任务时仍然要抛出 404。\n\n## 验证方式\n\n- 打开 `/docs`。\n- 执行 `DELETE /tasks/{task_id}`。\n- 再执行 `GET /tasks`。\n- 如果对应任务消失，说明删除成功。\n\n## 下一步\n\n完整 CRUD 已完成，但当前 `tasks = []` 仍是内存数据。服务重启后数据会消失，所以下一阶段要进入 SQLite + SQLAlchemy，把数据真正保存到数据库。"
  },
  {
    "slug": "python后端-fastapi-crud接口-put-tasks-task-id-更新任务",
    "title": "PUT 更新任务",
    "type": "FastAPI",
    "date": "2026-06-03",
    "minutes": 3,
    "category": "PYTHON后端/FASTAPI/CRUD接口",
    "categoryPath": [
      "PYTHON后端",
      "FASTAPI",
      "CRUD接口"
    ],
    "tags": [
      "FASTAPI",
      "CRUD接口"
    ],
    "summary": "前面已经能查询和新增任务，但还不能修改已有任务。真实任务管理 API 需要支持用户把任务标题、描述或完成状态改掉。",
    "source": "PYTHON后端\\FASTAPI\\CRUD接口\\PUT-tasks-task_id-更新任务.md",
    "body": "## 问题是什么\n\n前面已经能查询和新增任务，但还不能修改已有任务。真实任务管理 API 需要支持用户把任务标题、描述或完成状态改掉。\n\n## 用了什么知识点\n\n- FastAPI 的 `@app.put()` 路由。\n- REST API 中 `PUT` 表示更新资源。\n- 路径参数：`task_id: int`。\n- 请求体模型：`updated_task: Task`。\n- Python 的 `enumerate()` 同时拿到列表下标和元素。\n- `HTTPException(status_code=404)` 处理资源不存在。\n\n## 怎么解决\n\n在 `main.py` 中新增更新接口，通过 URL 找到任务 id，再用请求体里的新数据替换原列表中的元素。\n\n```python\n@app.put(\"/tasks/{task_id}\")\ndef update_task(task_id: int, updated_task: Task):\n    for index, task in enumerate(tasks):\n        if task[\"id\"] == task_id:\n            tasks[index] = {\n                \"id\": task_id,\n                \"title\": updated_task.title,\n                \"description\": updated_task.description,\n                \"done\": updated_task.done,\n            }\n            return {\"message\": \"任务更新成功\", \"task\": tasks[index]}\n\n    raise HTTPException(status_code=404, detail=\"任务不存在\")\n```\n\n## 解决了什么问题\n\n项目从“只能创建和查看任务”升级为“可以修改已有任务”。这补上了 CRUD 中的 Update 能力，也练习了路径参数和请求体同时使用的接口写法。\n\n## 易错点\n\n- `task = xxx` 只会修改循环变量，不会修改原列表。\n- 必须用 `enumerate(tasks)` 拿到 `index`，再执行 `tasks[index] = xxx`。\n- 找不到任务时不要返回假成功，要抛出 404。\n- 请求体字段要和 `Task` 模型一致，否则 FastAPI 会校验失败。\n\n## 验证方式\n\n- 打开 `/docs`。\n- 执行 `PUT /tasks/{task_id}`。\n- 示例 body：\n\n```json\n{\n  \"title\": \"学习 FastAPI PUT\",\n  \"description\": \"正在学习更新接口\",\n  \"done\": true\n}\n```\n\n- 再执行 `GET /tasks`，确认对应任务内容已变化。\n\n## 下一步\n\n更新完成后，CRUD 还差最后一步：删除任务，也就是 `DELETE /tasks/{task_id}`。"
  },
  {
    "slug": "linux入门-常用命令",
    "title": "常用命令",
    "type": "Linux",
    "date": "2026-06-02",
    "minutes": 6,
    "category": "Linux入门/常用命令",
    "categoryPath": [
      "Linux入门",
      "常用命令"
    ],
    "tags": [
      "常用命令"
    ],
    "summary": "分类 命令 作用 常用示例 示例说明",
    "source": "Linux入门\\常用命令.md",
    "body": "| 分类    | *==**命令**==*                 | 作用          | 常用示例                               | 示例说明                |\n| ----- | ---------------------------- | ----------- | ---------------------------------- | ------------------- |\n| 文件/目录 | *==**`pwd`**==*              | 查看当前路径      | `pwd`                              | 显示当前所在目录            |\n| 文件/目录 | *==**`ls`**==*               | 查看目录内容      | `ls -l`                            | 以详细列表方式显示           |\n| 文件/目录 | *==**`ls -a`**==*            | 查看隐藏文件      | `ls -a`                            | 显示 `.git` 等隐藏文件     |\n| 文件/目录 | *==**`cd`**==*               | 切换目录        | `cd /home/user`                    | 进入指定目录              |\n| 文件/目录 | *==**`cd ..`**==*            | 返回上一级       | `cd ..`                            | 返回父目录               |\n| 文件/目录 | *==**`mkdir`**==*            | 创建目录        | `mkdir project`                    | 创建 `project` 文件夹    |\n| 文件/目录 | *==**`touch`**==*            | 创建文件        | `touch app.py`                     | 创建空文件               |\n| 文件/目录 | *==**`cp`**==*               | 复制文件/目录     | `cp a.txt b.txt`                   | 复制文件                |\n| 文件/目录 | *==**`cp -r`**==*            | 复制目录        | `cp -r src backup`                 | 递归复制目录              |\n| 文件/目录 | *==**`mv`**==*               | 移动/重命名      | `mv old.txt new.txt`               | 重命名文件               |\n| 文件/目录 | *==**`rm`**==*               | 删除文件        | `rm test.txt`                      | 删除文件                |\n| 文件/目录 | *==**`rm -r`**==*            | 删除目录        | `rm -r temp`                       | 删除目录及内容             |\n| 文件/目录 | *==**`find`**==*             | 查找文件        | `find . -name \"*.py\"`              | 查找当前目录下所有 Python 文件 |\n| 文件/目录 | *==**`tree`**==*             | 树状显示目录      | `tree`                             | 需要先安装               |\n| 文件查看  | *==**`cat`**==*              | 查看文件内容      | `cat app.py`                       | 输出整个文件              |\n| 文件查看  | *==**`less`**==*             | 分页查看文件      | `less log.txt`                     | 适合查看长日志             |\n| 文件查看  | *==**`head`**==*             | 查看前几行       | `head -n 10 log.txt`               | 查看前 10 行            |\n| 文件查看  | *==**`tail`**==*             | 查看后几行       | `tail -n 20 log.txt`               | 查看后 20 行            |\n| 文件查看  | *==**`tail -f`**==*          | 实时查看日志      | `tail -f app.log`                  | 动态跟踪日志              |\n| 文件查看  | *==**`grep`**==*             | 搜索文本        | `grep \"error\" app.log`             | 查找包含 error 的行       |\n| 文件查看  | *==**`wc`**==*               | 统计行数/单词数    | `wc -l app.py`                     | 统计行数                |\n| 权限管理  | *==**`chmod`**==*            | 修改权限        | `chmod +x run.sh`                  | 增加执行权限              |\n| 权限管理  | *==**`chown`**==*            | 修改所有者       | `sudo chown user:user file.txt`    | 修改文件拥有者             |\n| 系统信息  | *==**`uname -a`**==*         | 查看系统信息      | `uname -a`                         | 查看内核和系统版本           |\n| 系统信息  | *==**`top`**==*              | 查看进程占用      | `top`                              | 类似任务管理器             |\n| 系统信息  | *==**`htop`**==*             | 增强版进程查看     | `htop`                             | 更友好，需要安装            |\n| 系统信息  | *==**`df -h`**==*            | 查看磁盘空间      | `df -h`                            | 人类可读格式              |\n| 系统信息  | *==**`du -sh`**==*           | 查看目录大小      | `du -sh project/`                  | 查看项目占用空间            |\n| 系统信息  | *==**`free -h`**==*          | 查看内存        | `free -h`                          | 查看 RAM 使用情况         |\n| 进程管理  | *==**`ps aux`**==*           | 查看所有进程      | `ps aux                            | grep python`        |\n| 进程管理  | *==**`kill`**==*             | 结束进程        | `kill 1234`                        | 杀死 PID 为 1234 的进程   |\n| 进程管理  | *==**`kill -9`**==*          | 强制结束进程      | `kill -9 1234`                     | 强制杀死进程              |\n| 网络相关  | *==**`ping`**==*             | 测试网络        | `ping baidu.com`                   | 检查网络连接              |\n| 网络相关  | *==**`curl`**==*             | 请求 URL      | `curl https://example.com`         | 获取网页内容              |\n| 网络相关  | *==**`wget`**==*             | 下载文件        | `wget https://example.com/a.zip`   | 下载文件                |\n| 网络相关  | *==**`ssh`**==*              | 远程登录        | `ssh user@192.168.1.10`            | SSH 登录服务器           |\n| 网络相关  | *==**`scp`**==*              | 远程传文件       | `scp a.txt user@ip:/home/user`     | 上传文件                |\n| 压缩解压  | *==**`tar`**==*              | 打包压缩        | `tar -czvf app.tar.gz app/`        | 压缩目录                |\n| 压缩解压  | *==**`tar -xzvf`**==*        | 解压 tar.gz   | `tar -xzvf app.tar.gz`             | 解压文件                |\n| 压缩解压  | *==**`zip`**==*              | zip 压缩      | `zip -r test.zip test/`            | 压缩目录                |\n| 压缩解压  | *==**`unzip`**==*            | 解压 zip      | `unzip test.zip`                   | 解压 zip 文件           |\n| 软件管理  | *==**`sudo apt update`**==*  | 更新软件源       | `sudo apt update`                  | 更新包列表               |\n| 软件管理  | *==**`sudo apt upgrade`**==* | 升级软件        | `sudo apt upgrade`                 | 升级已安装软件             |\n| 软件管理  | *==**`sudo apt install`**==* | 安装软件        | `sudo apt install git`             | 安装 Git              |\n| 软件管理  | *==**`sudo apt remove`**==*  | 卸载软件        | `sudo apt remove git`              | 删除软件                |\n| 开发常用  | *==**`git clone`**==*        | 克隆仓库        | `git clone https://github.com/...` | 下载项目                |\n| 开发常用  | *==**`python3`**==*          | 运行 Python   | `python3 app.py`                   | 执行 Python 程序        |\n| 开发常用  | *==**`pip install`**==*      | 安装 Python 包 | `pip install fastapi`              | 安装依赖                |\n| 开发常用  | *==**`code .`**==*           | VSCode 打开目录 | `code .`                           | 当前目录打开 VSCode       |\n| 开发常用  | *==**`history`**==*          | 查看历史命令      | `history`                          | 查看执行过的命令            |\n| 开发常用  | *==**`clear`**==*            | 清空终端        | `clear`                            | 清屏                  |\n| 开发常用  | *==**`man`**==*              | 查看命令手册      | `man ls`                           | 查看 `ls` 帮助文档        |"
  },
  {
    "slug": "linux入门-问题记录-问题记录",
    "title": "问题记录",
    "type": "问题记录",
    "date": "2026-06-02",
    "minutes": 3,
    "category": "Linux入门/问题记录",
    "categoryPath": [
      "Linux入门",
      "问题记录"
    ],
    "tags": [
      "问题记录"
    ],
    "summary": "python3 m venv .venv",
    "source": "Linux入门\\问题记录\\问题记录.md",
    "body": "1.创建虚拟环境\n- `python3 -m venv .venv`  \n    才是创建\n- `source .venv/bin/activate`  \n    只是激活已经存在的环境"
  },
  {
    "slug": "python后端-db-数据库相关学习-mysql",
    "title": "MYSQL",
    "type": "数据库",
    "date": "2026-03-23",
    "minutes": 14,
    "category": "PYTHON后端/DB",
    "categoryPath": [
      "PYTHON后端",
      "DB"
    ],
    "tags": [
      "DB"
    ],
    "summary": "·cd C:\\\\Program Files\\\\MySQL\\\\MySQL Server 8.0\\\\bin",
    "source": "PYTHON后端\\DB\\数据库相关学习\\MYSQL.md",
    "body": "·cd C:\\\\Program Files\\\\MySQL\\\\MySQL Server 8.0\\\\bin\n\nmysqld --defaults-file=\"C:\\\\ProgramData\\\\MySQL\\\\MySQL Server 9.6\\\\my.ini\" --shared-memory --skip-grant-tables\n\npassword 123456\n\n关系型数据库 （通过表结构存储数据的数据库）\n\n建立在关系模型基础上 多张相互连接的二维表组成的\tDB\n\n数据模型\n\n————\n\nSQL\n\nSQL通用语法\n\n可单行 可多行 分号;结尾\n\n可用空格和缩进\n\nSQL 语句不区分大小写 关键字建议用大写\n\n注释 ： #  或者 --\n\nSQL语句分类 增删查改\n\nDDL 定义数据库对象 -- 表结构 表中字段\n\nDML 对表中数据进行增删改\n\nDQL 查询数据库中表的记录\n\nDCL 创建数据库用户 。 控制访问权限\n\nDDL数据库\n\n展示所有数据库\n\nSHOW DATABASES;\n\n创建\n\nCREATE DATABASE \\[ IF NOT EXISTS] 数据库名  \\[DEFAULT CHARSET 字符集] \\[COLIATE 排序规则] ；\n\n删除\n\nDROP DATABASE \\[ IF EXISTS] 数据库名；\n\n使用\n\nUSE 数据库名\n\n查询当前数据库\n\nSELECT DATABASE();\n\nDDL - 表操作\n\n查询当前数据库所有表\n\nSHOW TABLES;\n\n查询表结构\n\nDESC 表名 // 展示简要信息\n\n查询指定表的建表语句\n\nSHOW CREATE TABLE表名; // 展示详细信息 包括注释\n\n创建\n\nCREATE TABLE 表名（\n\n字段1 字段1类型 [comment  字段1注释 ],\n\n字段2 字段2类型 [comment  字段2注释 ],\n\n）[表注释]\n\nCOMMENT 表示注释\n\nDDL - 表操作 - 数据类型\n\nTINY SHORT MEDIUM LONG\n\n数值类型：\n\nUNSIGNED 无符号\n\nINT 整型 -- 4\n\nFLOAT（长度。小数位数）-- 4\n\nDOUBLE（长度。小数位数） -- 8\n\n字符串类型:\n\nCHAR 定长字符串 -- 性能较好 确定用定长 -- 1\n\nVARCHAR（长度）变长字符串  -- 性能较差 不确定用变长 -- 4\n\nBLOG 二进制长文本数据 -- 4\n\nTEXT 长文本数据 -- 4\n\n日期类型：\n\nDATE 年-月-日 -- 2\n\nTIME 时-分-秒 -- 3\n\n//YEAR 年 -- 1\n\nDATETIME 年月日时分秒 -- 8\n\n//TIMESTAMP 年月日时分秒 时间戳 -- 4\n\nDDL - 表操作 - 改\n\n添加字段\n\nALTER TABLE 表名 ADD 字段名 类型（长度） [COMMENT 约束]\n\n修改数据类型\n\nALTER TABLE 表名 MODIFY 字段名 新数据类型\n\n修改字段名和字段类型\n\nALTER TABLE 表名 CHANGE 旧字段 新字段 类型\n\n删除字段\n\nALTER TABLE 表名 DROP 字段名\n\n修改表名\n\nALTER TABLE 表名 RENAME TO 新表名\n\n删除表 (谨慎操作  表内数据会全部删除\n\nDROP TABLE 表名\n\n快速删除表内所有数据 但是保留表结构\n\nTRUNCATE TABLE 表名 （TRUNCATE 意思是截断）\n\nDML -数据操作语言 -- 增删改\n\n添加数据 INSERT\n\n给指定字段添加数据\n\nINSERT INTO 表名 (字段名1，字段名2，...）VALUES(值1，值2,....);\n\n给全部字段添加数据\n\nINSERT INTO 表名 VALUES(值1，值2...);\n\n批量添加数据\n\nINSERT INTO 表名(字段名1，字段名2，...）VALUES(值1，值2,....)，(值1，值2,....)，值1，值2,....);\n\nINSERT INTO 表名 VALUES(值1，值2,....)，（值1，值2,....)，(值1，值2,....);\n\n**插入的字符串类型 或者 日期类型数据 需要由引号‘ ’标注**\n\n修改数据 UPDATE\n\nUPDATE 表名  SET 字段名1 = 值1 , 字段名2 = 值2，....... [ WHERE 条件];\n\n删除某一个字段的值\n\nUPDATE 表名 SET 字段名 = NULL;\n\n若未标注条件 则修改全部数据\n\n删除数据 DELETE\n\nDELETE FROM 表名 [ WHERE 条件]；\n\n若未标注条件 则删除全部数据\n\nDQL -- 数据查询语言 -- 查\n\nDQL - 基础查询\n\n查询多个字段\n\nSELECT 字段1，字段2... FROM 表名;\n\nSELECT * FROM 表名; // 实际操作中应当把所有字段名称罗列出来  增加效率\n\n设置别名（可有可无）\n\nSELECT 字段1 [ AS 别名1]，.... FROM 表名；\n\n去除重复记录\n\nSELECT  DISTINCT 字段列表 FROM 表名；\n\nDQL - 条件查询\n\nSELECT 字段列表 FROM 表名 WHERE 条件列表\n\n比较运算符\n\n！= 不等于\n\nBETWEEN...AND ... 在某个范围之内\n\nIN（...） 列表中的值 多选一\n\nLIKE 占位符 ， 模糊匹配 （_匹配单个字符 %匹配多个字符）\n\nLIKE ‘__’（查找两个字符的） LIKE '%X'（查找最后一位是X的）\n\nIS NULL  NULL值\n\n逻辑运算符\n\nAND\n\nOR\n\nNOT\n\nDQL - 聚合函数 - 纵向计算\n\nSELECT 聚合函数（字段列表） FROM 表名；\n\nCOUNT 统计数量\n\nMAX 最大值\n\nMIN 最小值\n\nAVG 平均值\n\nSUM 求和\n\n所有的NULL值不参与聚合函数计算\n\nDQL- 分组查询\n\nSELECT 字段列表 FROM 表名 [WEHRE 条件列表] GROUD BY 分组字段名 [ HAVING 分组后过滤条件];\n\nWHERE - 分组前执行  HAVING - 对分组后的结果过滤\n\nWHERE 不能对聚合函数进行判断 HAVING 可以\n\n执行顺序 *WHERE ＞　聚合函数　＞　HAVING*\n\nDQL - 排序查询\n\nSELECT 字段列表 FROM 表名 ORDER BY 字段1 排序方式1，字段2 排序方式2...;\n\n排序方式\n\nASC - 升序 默认\n\nDESC - 降序\n\n多字段排序 如果前一个字段值相同 才会执行第二个字段排序方式\n\nDQL - 分页查询\n\nSELECT 字段列表 FROM  表名 LIMIT 起始索引 ， 查询记录数；\n\n起始索引从0开始 **起始索引 = （查询页码 - 1）* 每页显示记录数**\n\n分页查询 不同DBMS 不同实现 MYSQL 是 LIMIT\n\n若查询第一页 起始索引可省略 ***LIMIT 记录数**；*\n\n编写顺序：         执行顺序\n\nSELECT 字段列表     -- 4\n\nFROM 表名  -- 1\n\nWHERE 条件  -- 2\n\nGROUD BY 分组 -- 3\n\nHAVING 分组后条件列表 -- 5 -- 无法对非聚合结果以及费GROUD BY  后的字段进行分析筛选\n\nORDER BY 排序列表 -- 5\n\nLIMIT 分页参数 -- 6\n\nDCL -- 数据控制语言\n\nDCL- 用户管理\n\n查询用户\n\nUSE mysql；\n\nSELECT * FROM user；\n\n创建用户\n\nCREATE USER ‘用户名’@‘主机名’ IDENTIFIED BY '密码'； % -- 任意主机\n\n修改用户密码\n\nALTER USER  用户名’@‘主机名’IDENTIFIED ~~WITH mysql_native_password~~ BY ‘新密码’\n\n删除用户\n\nDROP USER 用户名’@‘主机名;\n\nDCL - 权限控制\n\n所有权限 -- ALL / ALL PRIVILEGES\n\n查询权限\n\nSHOW GRANTS FOR ‘用户名’@‘主机名';\n\n授予权限\n\nGRANT 权限列表 ON 数据库名.表名 TO ‘用户名’@‘主机名’;\n\n撤销权限\n\nREVOKE 权限列表 ON  数据库名.表名 FROM ‘用户名’@‘主机名’;\n\n多个权限之间用逗号隔开 *表示所有表名/数据名\n\n函数  -- 调用内置程序/代码\n\n字符串函数\n\nCONCAT(S1,S2...) --  字符串拼接\n\nLOWER(str）-- 小写\n\nUPPER(str） -- 大写\n\nLPAD(str，n，pad） 用任意字符填充字符串左侧 直至长度为n\n\nRPAD 右侧同理\n\nTRIM （str） -- 去掉字符串头尾空格\n\nSUBSTRING(str，start，len） -- 返回字符串从start开始的len长度个字符串\n\n*SELECT  函数（参数）*\n\n数值函数\n\nCEIL(X)\n\nFLOOR(X)\n\nMOD（x，y） 返回X/Y的模\n\nRAND（） 返回0-1随机数\n\nROUND(X,Y) 返回x 四舍五入 保留y位小数\n\n日期函数\n\nCURDATE（）返回当前日期\n\nCURTIME（） 返回当前时间\n\nNOW（） 返回当前日期和时间\n\nYEAR(DATE()) -- 返回date中的年\n\nDATE_ADD (date,interval num type); -- 返回推算后的时间\n\n*DATEDIFF(date1，date2) -- 返回相差天数*\n\n流程函数\n\nIF（VALUE,t,f） -- 如果VALUE值为真 则返回t 反之\n\nIFNULL （VALUE1,VALUE2） -- 如果VALUE1不为空 则返回value1 否则返回value2\n\n*CASE [expr1字段] WHEN[VAL1] THEN[RES1] ...ELSE[DEFAULT] END --  若exp1 = val1 则返回res1 否则CASE  WHEN[VAL1] THEN[RES1] ...ELSE[DEFAULT] END -- 若val1为真 则返回res1 否则返回默认值 范围*\n\n空值处理函数\n\nCOALESCE（某字段,0） -- 将某字段中的null替换成 0\n\n约束 -- 作用表中字段 限制存储在表中的数据 -- 确保数据库有效性 完整性\n\n*对于一个字段可添加多个约束*\n\nPRIMARY KEY - 主键约束 非空且唯一\n\nNOT NULL -- 非空 AUTO_INCREMENT -- 自动增长\n\n当执行插入语句时，MySQL 在尝试插入前 就会为该记录分配一个自增 ID。如果随后由于约束失败导致插入失败，这个 ID 已经“使用”过了，即使插入失败，也不会被回收或重用。\n\nUNIQUE -- 唯一\n\nCHECK -- 检查约束 --CHECK 会在分配ID前进行检查 若约束失败 则不会分配自增ID 跳过存储引擎层\n\nDEFAULT -- 默认约束\n\n外键约束  -- 连接两张表的数据 保证数据一致完整 -- 具有外键的表称为子表\n\n外键约束语法：\n\n添加外键\n\n*ALTER TABLE 表名 ADD CONSTRAINT 外键名称FOREIGN KEY(外键字段名）REFERENCESN 主表（主表列名）*\n\n删除外键\n\nALTER TABLE 表名 DROP FOREIGN KEY 外键名称；\n\n外键删除更新行为\n\nRESTRICT/NO ACTION 父表删除 检查外键 存在则不删除、更新\n\nCASCADE -- 级联 父表删除 检查外键 若有 则一起删除子表记录\n\nALTER TABLE 表名\n\nADD_CONSTRAINT 外键名称\n\nFOREIGN KEY(外键字段名）\n\nREFERENCESN 主表（主表列名）\n\nON UPDATE CASCADE\n\nON DELETE CASCADE\n\nSET NULL -- 父表删除 子表设置NULL -- 要求NOT NULL\n\nSETNULL 语法与CASCADE同理\n\nSET DEFAULT\n\n多表查询\n\n多表关系：\n\n1:1 、 任意一方设置外键 关联另一方主键 并将外键设置为UNIQUE\n\n1：n、 在n的一方建立外键\n\nm：n 建立中间表 外键关联多张表之间的主键\n\n多表合并\n\nUNION -- 必须列数相同 排列顺序相同 -- 手动补\n\nUNION ALL 不去重\n\nSELECT* FROM 表名1 UNION ALL SELECT * FROM 表名2\n\nUNION 去重\n\n子查询 嵌套查询 --  查询的结果无法一次性完成 则进行子查询\n\nWHERE子查询  -- 标量子查询 -- 返回单个值\n\n列子查询 -- IN NOT IN ALL SOME ANY 返回一列多行\n\nHAVING子查询  --\n\nFROM子查询 -- 表子查询 -- 返回多行多列\n\nSELECT 子查询\n\nJOIN -- 连接 相同字段匹配\n\n内连接 -- 两张表交集部分\n\n隐式内连接\n\n*SELECT 字段列表 FROM 表1，表2 WHERE 条件...*\n\n显示内连接\n\n*SELECT 字段列表 FROM 表1 JOIN 表2 ON 连接条件*\n\n外连接\n\n左外连接 -- 左表所有数据 且 表1表2交集 -- EXCEL vlookup\n\n*SELECT 字段列表 FROM  表1 LEFT JOIN 表2 ON 条件；*\n\n右外连接 -- 同理//\n\nSELECT 字段列表\n\nFROM  表1\n\nRIGHT JOIN表2\n\nON 条件；\n\n全连接 -- 数据全部保留 保留null值\n\n自连接\n\n*SELECT 字段列表 FROM 表1 别名 JOIN 表1 别名2 ON 条件；*\n\n窗口函数  *数据库内部复制一份副本 进行内部分区和条件*\n\n*OVER(PARTITION BY 字段名 [ORDER BY 字段列表]） -RANK（）-- 排序函数"
  }
];
