
/**定义一个类 用于创建VUE实例*/
class Vue {
    constructor(options = {}) {
        // 给Vue实例 增加 属性
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods
        // 监视data中的数据
        new Observe(this.$data)
        // 把data中所有的数据代理到vm上
        this.proxy(this.$data)
        // 把methods中所有的数据代理到了vm上
        this.proxy(this.$methods)
        if (this.$el) {
            // compile负责解析模板内容
            // 需要：模板和数据
            new Compile(this.$el, this)
        }
        
    }
    proxy(data) {
        Object.keys(data).forEach( key => {
            Object.defineProperty(this,key,{
                enumerable:true,
                configurable:true,
                get () {
                    return data[key]
                },
                set (newValue) {
                    if(data[key] === newValue) {
                        return
                    }
                    data[key] = newValue
                },
            })
        })
    }
}