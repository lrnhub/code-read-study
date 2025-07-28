## 向量空间与线性变换

## 1. 向量空间

### 定义

向量空间是一个集合 $V$，其上定义了加法和标量乘法运算，满足以下公理：

1. **加法封闭性：** $\mathbf{u} + \mathbf{v} \in V$
2. **加法交换律：** $\mathbf{u} + \mathbf{v} = \mathbf{v} + \mathbf{u}$
3. **加法结合律：** $(\mathbf{u} + \mathbf{v}) + \mathbf{w} = \mathbf{u} + (\mathbf{v} + \mathbf{w})$
4. **零向量：** 存在 $\mathbf{0} \in V$，使得 $\mathbf{v} + \mathbf{0} = \mathbf{v}$
5. **逆向量：** 对每个 $\mathbf{v} \in V$，存在 $-\mathbf{v} \in V$，使得 $\mathbf{v} + (-\mathbf{v}) = \mathbf{0}$
6. **标量乘法封闭性：** $c\mathbf{v} \in V$
7. **分配律：** $c(\mathbf{u} + \mathbf{v}) = c\mathbf{u} + c\mathbf{v}$
8. **结合律：** $(cd)\mathbf{v} = c(d\mathbf{v})$
9. **单位元：** $1\mathbf{v} = \mathbf{v}$

### 常见向量空间

- $\mathbb{R}^n$：n维实向量空间
- $\mathbb{C}^n$：n维复向量空间
- $P_n$：次数不超过n的多项式空间

## 2. 线性变换

### 定义

线性变换 $T: V \to W$ 满足：

1. **加法性：** $T(\mathbf{u} + \mathbf{v}) = T(\mathbf{u}) + T(\mathbf{v})$
2. **齐次性：** $T(c\mathbf{v}) = cT(\mathbf{v})$

### 矩阵表示

线性变换可以用矩阵表示：

$$T(\mathbf{x}) = A\mathbf{x}$$

其中 $A$ 是变换矩阵。

## 3. 特征值与特征向量

### 定义

对于矩阵 $A$，如果存在非零向量 $\mathbf{v}$ 和标量 $\lambda$，使得：

$$A\mathbf{v} = \lambda\mathbf{v}$$

则称 $\lambda$ 为 $A$ 的特征值，$\mathbf{v}$ 为对应的特征向量。

### 特征方程

特征值满足特征方程：

$$\det(A - \lambda I) = 0$$

## 4. 对角化

### 定义

矩阵 $A$ 可对角化，当且仅当存在可逆矩阵 $P$ 和对角矩阵 $D$，使得：

$$A = PDP^{-1}$$

### 对角化条件

矩阵可对角化的充分必要条件是它有n个线性无关的特征向量。
