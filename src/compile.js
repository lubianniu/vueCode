// compile文件负责解析内容
class Compile {
    // 参数一是模板，参数二是整个实例
    constructor(el,vm) {
        // el: new Vue 传递的选择器
        this.el = typeof el === 'string' ? document.querySelector(el) : el//querySelector() 方法返回文档中匹配指定 CSS 选择器的一个元素。
        // vm: new Vue 的实例
        this.vm = vm
        // 编译模板
        if (this.el){
            // 1.把el中所有的子节点都放入到内存中（fragment）fragment把数据存到内存中，不会生产DOM因此不会产生回流（提升性能）
            let fragment = this.node2fragment(this.el)
            // 2.在内存中编译fragment
            this.compile(fragment)
            // 3.把fragment一次性的添加到页面
            this.el.appendChild(fragment)
        }
    }

    // 核心方法（把数据放到fragment里面）
    node2fragment(node) {
        let fragment =  document.createDocumentFragment()
        // 把el中所有的子节点挨个添加到文档碎片中
        let childNodes = node.childNodes
        this.toArray(childNodes).forEach(node => {
            //  把所有的子节点放到fragment
            fragment.appendChild(node)
        })
        return fragment
    }
    // 编译文档碎片（内存中）
    compile(fragment){
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach( node => {
            // 编译子节点
            if(this.isElementNode(node)){
                // 如果是元素，需要解析指令
                this.compileElement(node)
            }
            if(this.isTextNode(node)){
                // 如果是文本节点，需要解析插值表达式
                this.compileText(node)
            }
            // 如果当前节点外面有一层元素包裹需要递归
            if( node.childNodes && node.childNodes.length > 0 ){
                this.compile(node)
            }
        })
    }
    // 元素节点解析指令
    compileElement(node){
        // 解析元素节点（里面所有已v-开头的指令）
        let attributes = node.attributes
        this.toArray(attributes).forEach(attr => {
            let attrName = attr.name
            if(this.isDirective(attrName)){
                let expr = attr.value
                let type = attrName.slice(2)
                // 解析v-click指令
                if(this.isEventDirective(type)){
                    CompileUtil['eventHandler'](node,this.vm,type,expr)
                }else {
                    CompileUtil[type] && CompileUtil[type](node,this.vm,expr)
                }
            }
        })
    }
    // 文本节点解析文本
    compileText(node){
        CompileUtil.mustache(node,this.vm)
    }
    // 工具方法
    toArray(likeArray) {
        return [].slice.call(likeArray)
    }
    // 节点判断元素节点
    isElementNode(node){
        // nodeType:节点类型：1是元素节点，2是属性节点，3是文本节点
        return node.nodeType === 1
    }
    // 节点判断文本节点
    isTextNode(node){
        return node.nodeType === 3
    }
    // 是否是一个指令
    isDirective(attrName){
        return attrName.startsWith('v-')
    }
    // 是否是一个事件指令
    isEventDirective(attrName){
        return  attrName.split(':')[0] === 'on'
    }
}

let CompileUtil = {
    mustache(node,vm) {
        let txt = node.textContent
        let reg = /\{\{(.+)\}\}/
        if(reg.test(txt)){
            let expr = RegExp.$1
            // debugger
            node.textContent = txt.replace(reg,this.getVMValue(vm,expr))

            new Watcher(vm,expr,newValue => {
                node.textContent =txt.replace(reg,newValue)
            })
        }
    },
    text(node,vm,expr){
        node.textContent = this.getVMValue(vm,expr)
        // 通过watcher对象，监听expr变化，一旦变化了，就执行回调函数
        new Watcher(vm,expr,(newValue,oldValue) => {
            node.textContent = newValue
        })
    },
    html(node,vm,expr){
        node.innerHTML = this.getVMValue(vm,expr)
        new Watcher(vm,expr,newValue => {
            node.innerHTML = newValue
        })
    },
    model(node,vm,expr){
        let self = this
        node.value = this.getVMValue(vm,expr)
        // 实现双相数据绑定，给node注册input事件，当前元素的value值方式改变，修改对应的数据
        node.addEventListener('input',function() {
            self.setVMValue(vm,expr,this.value)
            // vm.$data[expr] = this.value
        })
        new Watcher(vm,expr,newValue => {
            node.value = newValue
        })
    },
    eventHandler(node,vm,type,expr){
        let eventType = type.split(':')[1]
        let fn = vm.$methods && vm.$methods[expr]
        if(eventType && fn){
            node.addEventListener(eventType,fn.bind(vm))
        }
        
    },
    // 获取vm中的数据
    getVMValue(vm,expr){
        // 获取到data中的数据
        // debugger
        let data = vm.$data
        expr.split(".").forEach( key => {
           data = data[key]
        })
        return data
    },
    setVMValue(vm,expr,value){
        let data = vm.$data
        let arr =  expr.split('.')
        arr.forEach( (key,index) => {
            if(index < arr.length - 1 ) {
                data = data[key]
            }else{
                data[key] = value
            }
        })
    }
}