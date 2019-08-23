const is = require("is-type-of")
const FileLoader = require("./fileLoader")
const CLASSLOADER = Symbol("classLoader")

class ClassLoader {
    constructor(options) {
        const properties = options.properties
        this._cache = new Map()
        this._ctx = options.ctx

        for (const property in properties) {
            this.defineProperty(property, properties[property])
        }
    }

    defineProperty(property, values) {
        Object.defineProperty(this, property, {
            get() {
                let instance = this._cache.get(property)
                if (!instance) {
                    instance = getInstance(values, this._ctx)
                    this._cache.set(property, instance)
                }
                return instance
            }
        })
    }
}

class ContextLoader extends FileLoader {
    constructor(options) {
        const target = (options.target = {})
        super(options)

        const app = this.options.inject
        const property = this.options.property

        Object.defineProperty(app.context, property, {
            get() {
                if (!this[CLASSLOADER]) {
                    this[CLASSLOADER] = new Map()
                }
                const classLoader = this[CLASSLOADER]

                let instance = classLoader.get(property)
                if (!instance) {
                    instance = getInstance(target, this)

                    classLoader.set(property, instance)
                }

                return instance
            }
        })
    }
}

function getInstance(values, ctx) {
    const Class = values["exports"] ? values : null

    let instance
    if (Class) {
        if (is.class(Class)) {
            instance = new Class(ctx)
        } else {
            instance = Class
        }
    } else {
        instance = new ClassLoader({ ctx, properties: values })
    }
    return instance
}

module.exports = ContextLoader
