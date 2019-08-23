"use strict"

const fileLoader = require("./fileLoader")
const contextLoader = require("./contextLoader")
const logger = require("../../utils/winston")

class CoreLoader {
    constructor(options) {
        this.options = options
        this.app = this.options.app
    }

    loadToApp(directory, property, opt) {
        const target = (this.app[property] = {})
        opt = Object.assign(
            {},
            {
                directory,
                target
            },
            opt
        )

        new fileLoader(opt).loadFile()
    }

    loadToContext(directory, property, opt) {
        opt = Object.assign(
            {},
            {
                directory,
                property,
                inject: this.app
            },
            opt
        )

        new contextLoader(opt).loadFile()
    }

    loadController() {
        const opt = {}
        this.loadToContext(
            process.cwd() + "/server/controller",
            "controller",
            opt
        )

        logger.info("加载controller完成")
    }

    loadService() {
        const opt = {}
        this.loadToContext(process.cwd() + "/server/service", "service", opt)

        logger.info("加载service完成")
    }

    loadRouter() {
        const fileloader = new fileLoader({})
        const files = fileloader.readFile(process.cwd() + "/server/routes")

        for (const file of files) {
            const router = fileloader.requireFile(file)
            const routeInstance = router(this.app)
            this.app.use(
                routeInstance.routes(),
                routeInstance.middleware(),
                routeInstance.allowedMethods()
            )
        }

        logger.info("加载router完成")
    }

    loadMiddleware() {
        const fileloader = new fileLoader({})
        const files = fileloader.readFile(process.cwd() + "/server/middleware")

        for (const file of files) {
            const router = fileloader.requireFile(file)
            this.app.use(router())
        }

        logger.info("加载middleware完成")
    }

    load() {
        this.loadController()
        this.loadService()
        this.loadMiddleware()
        this.loadRouter()
    }
}

module.exports = CoreLoader
