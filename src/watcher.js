// @ts-nocheck
/**
 *watvher模块负责把compile模块和observe模块关联起来 
*/
class Watcher {
    // vm: 当前Vue的实例
    // expr: data中的数据
    // 一旦数据发生了改变，需要调用cb
    constructor (vm,expr,cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb

        // this表示的就是新创建的watcher对象
        // 存储到Dep.target
        Dep.target = this

        // 获取data里面的旧值
        this.oldValue = this.getVMValue(vm,expr)
        // 清空Dep.target
        Dep.target = null
    }
    // 对外暴露的一个方法，这个方法用于更新页面
    updata(){
        // 对比expr是否发生改变，如果发生了改变，需要调用cb
        let oldValue = this.oldValue
        let newValue = this.getVMValue(this.vm,this.expr)
        if(oldValue != newValue) {
            this.cb(newValue,oldValue)
        }
    }

    // 获取vm中的数据
    getVMValue(vm,expr){
        // 获取到data中的数据
        // debugger
        let data = vm.$data
        expr.split(".").forEach( key => {
           data = data[key]
        })
        return data
    }
}

// dep对象用于管理所有的订阅者和通知这些订阅者
class Dep {
    constructor () {
        // 管理定订阅者
        this.subs = []
    }
    // 添加订阅者
    addSubs(watcher) {
        this.subs.push(watcher)
    }
    // 通知
    notify() {
        // 遍历所有的订阅者，调用watcher的updata方法
        this.subs.forEach( sub => {
            sub.updata()
        })
    }
}