// @ts-nocheck
/*
observe主要用于 处理vm.$data里面的数据

*/ 
class Observe {
    constructor (data){
        this.data = data 
        this.walk(data)
    }
    /**
     *  核心方法 
    */
    //   遍历data中 所有的数据，都添加上getter 和setter 
    walk(data) {
        if(!data || typeof data  != 'object'){
            return
        }
        Object.keys(data).forEach( key => {
        //    给data对象的key设置getter 和setter 
            this.defineReactive(data,key,data[key])

            this.walk(data[key])
        })
    }
    // 定义getter和stter 方法
    // dep保存了所有订阅了该数据的订阅者
    defineReactive(obj,key,value){
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj,key,{
            configurable:true,//可以编辑
            enumerable:true,//可以遍历
            get () { //监听获取到数据
                // 如果 Dep.target 中 有watcher对象，存储到订阅者数组中
                Dep.target && dep.addSubs(Dep.target)
                return value
            },
            set (newValue) {//监听到修改数据
                if(value === newValue){
                    return
                }
                value = newValue
                // 如果newValue是一个对象,也应该对他进行劫持
                that.walk(newValue)
                // 发布通知，让所有的订阅者更新内容
                dep.notify()
            },
        })
    }
}