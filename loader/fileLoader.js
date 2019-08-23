const globby = require("globby")
const path = require("path")
const is = require("is-type-of")

const defaults = {
    directory: null,
    target: null
}

class FileLoader {
    constructor(options) {
        this.options = Object.assign({}, defaults, options)
    }

    loadFile() {
        const items = this.parseFile()
        const target = this.options.target

        for (const item of items) {
            item.properties.reduce((target, property, index) => {
                let obj
                // const properties = item.properties.slice(0, index + 1).join(".")

                // 确保每一层都能被实例化，防止crash
                if (index === item.properties.length - 1) {
                    obj = item.exports

                    if (obj) {
                        obj["exports"] = true
                    }
                } else {
                    obj = target[property] || {}
                }

                target[property] = obj

                return obj
            }, target)
        }

        return target
    }

    // 将文件流信息抽象成文件树
    parseFile() {
        const files = ["**/*.js"]
        const filePaths = globby.sync(files, { cwd: this.options.directory })
        const items = []

        for (const filePath of filePaths) {
            const fullPath = path.join(this.options.directory, filePath)
            const exports = this.getExports(fullPath)
            const properties = this.getProperties(filePath)
            const pathName =
                this.options.directory.split(/[/\\]/).slice(-1) +
                "." +
                properties.join(".")

            if (is.class(exports)) {
                exports.prototype.pathName = pathName
                exports.prototype.fullPath = fullPath

                items.push({ fullPath, properties, exports, pathName })
            }
        }

        return items
    }

    readFile(directory) {
        const files = ["**/*.js"]
        const filePaths = globby.sync(files, { cwd: directory })

        return filePaths.map((item) => {
            return path.join(directory, item)
        })
    }

    requireFile(file) {
        const obj = require(file)
        if (obj) return obj
    }

    getExports(filePath) {
        const fileObj = this.requireFile(filePath)

        if (is.class(fileObj)) {
            return fileObj
        } else {
            return null
        }
    }

    getProperties(fullPath) {
        const properties = fullPath
            .substring(0, fullPath.lastIndexOf("."))
            .split("/")

        return properties.map((property) => {
            property = property.replace(/[_-][a-z]/gi, (s) =>
                s.substring(1).toUpperCase()
            )

            return property
        })
    }
}

module.exports = FileLoader
