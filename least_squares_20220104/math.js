(function() {
    var context = null
    /*
    if (typeof(math) !== 'undefined') {
        context = math
    }
    else context = new Object
    */
    
    if (typeof(math) == 'undefined') {
        throw Error("requires the mathjs package")
    }
        
    
    context = math 
    /* 
    导出函数到context
    */
    function _export(name, obj) {
        context[name] = obj
    }
    
    /*
    给定方阵s
    该函数求一个Givens旋转矩阵g。经过g×s×gT的相似变换，
    s在i行j列处的值变为0
    */
    _export('givensRotation', function (s, i, j) {
        console.assert(i != j)
        console.assert(s.size()[0] === s.size()[1])
        let size = s.size()[0]
        
        //求Givens矩阵
        let sii = s.subset(math.index(i, i))
        let sjj = s.subset(math.index(j, j))
        let sij = s.subset(math.index(i, j))
        let theta = 0
        if(math.abs(sii - sjj) < 1e-9)
            theta = math.pi / 4
        else 
            theta = math.atan(2 * sij / (sjj - sii)) / 2
        let g = math.identity(size, size)
        g.set([i, i], math.cos(theta))
        g.set([j, j], math.cos(theta))
        g.set([i, j], -math.sin(theta))
        g.set([j, i], math.sin(theta))
        return g				
    })
    
    
    /*
    求对称阵a的特征值和相应的特征向量
    注意事项：
      1. a必须是实对称矩阵
      2. 返回特征值和对应的特征向量。特征向量是从大到小排列的；特征向量是行向量，与特征值一一对应，堆叠成方阵。
    */
    _export('eigens', function (a) {
        let shape = a.size()
        console.assert(shape[0] === shape[1])
        console.assert(math.max(math.abs(math.subtract(math.transpose(a), a))) < 1e-8)
        let len = shape[0]
        
        max = 1
        eps = 1e-8
        iter = 10000
        ls = []
        //while(max > eps & (iter-- > 0))
        while(max > eps)
        {
            //得到最大的非对角线上元素的位置
            let i = 0, j = 0, v = null
            for(let ii = 0; ii < len; ii++){
                for(let jj = 0; jj < len; jj++){
                    if(ii === jj)
                        continue
                    let c = math.abs(a.get([ii, jj]))
                    if(v === null || c > v){
                        v = c
                        i = ii
                        j = jj
                    }
                }
            }
            max = v
            
            g = context['givensRotation'](a, i, j)
            ls.push(g)
            a = math.multiply(g, math.multiply(a, math.transpose(g)))
        }
        
        ev = math.identity(len, len)
        for(let i = 0; i < ls.length; i++){
            ev = math.multiply(ls[i], ev)
        }
        console.assert(math.abs(math.det(ev) - 1) < 1e-9)
        console.assert(math.max(math.abs(math.subtract(math.multiply(ev, math.transpose(ev)), math.identity(len, len)))) < 1e-9)
        
        //取对角线上的元素，得到特征值
        diag = []
        for(let i = 0; i < len; i++){
            diag.push(a.get([i, i]))
        }
        
        //重新整理，使特征值从大到小排列
        ls = []
        for(let i = 0; i < len; i++)
            ls.push(i)
        for(let i = 0; i < len; i++){
            for(let j = i + 1; j < len; j++){
                if(diag[i] < diag[j]){
                    temp = ls[i]
                    ls[i] = ls[j]
                    ls[j] = temp
                }
            }
        }
        let diag1 = [], ev1 = math.zeros(len, len)
        for(let i = 0; i < len; i++){
            diag1[i] = diag[ls[i]]
            for(let j = 0; j < len; j++){
                ev1.set([i, j], ev.get([ls[i], j]))
            }
        }
        return [diag1, ev1]
    })
    
    
})()    