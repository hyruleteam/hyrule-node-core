const Koa = require("koa")
const coreLoader = require("./loader/coreLoader")

class Core extends Koa {
    constructor(options) {
        super()
        this.options = options
        this.coreLoader = new coreLoader({
            app: this
        })
    }

    start() {
        this.coreLoader.load()
    }
}

module.exports = Core
