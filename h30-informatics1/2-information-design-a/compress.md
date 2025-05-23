---
type: "knowledge"
abstract: "デジタルデータの圧縮の種類や方法について学びます。"
recommendation: []
authors: ["北村祐稀<u961432b@ecs.osaka-u.ac.jp>"]
editors: []
---

# デジタルデータの圧縮

## デジタルデータの圧縮

情報を単純な方法でデジタル化すると、データ量が過度に膨大になってしまうことがあります。例えば動画をデジタル化するとき、単純な方法では、フレームごとに画像をデジタル化します。しかし、静止画を数秒ごとに切り替えるようなスライドショー形式の動画では、ほとんどが同じフレームの繰り返しになってしまい、無駄があります。フレーム間に変化があるときだけ新しいフレームの画像をデジタル化すれば十分です。

このように、情報の特性を活かして、意味を保ったままよりデータ量を減らすことを**圧縮**といいます。また、圧縮されたデータをもとのデータに戻すことを**展開（解凍）**といいます。

**圧縮率**は $(圧縮後のデータ量) \div (もとのデータ量)$ で表されます。圧縮率 $100 \%$ はまったく圧縮されていない状態、圧縮率 $1 \%$ は非常に効率良く圧縮された状態です。

## 可逆圧縮と非可逆圧縮

もとのデータに戻すことのできる圧縮形式を**可逆圧縮**といいます。

上の動画の例は可逆圧縮です。

もとのデータに戻すことのできない圧縮形式を**非可逆圧縮**といいます。

例えば画像をデジタル化するとき、一般に各ピクセルを約 1677 万色で表すフルカラーという規格が用いられています。しかし、人間の目ではこれだけ多くの色を正確に区別することはできず、多少色が変わっていても気づきません。このように多少の色の変化を許容する方法は非可逆圧縮です。

## ランレングス法

**ランレングス法**は、同じデータの連続した出現を省略して、代わりに連続する回数を示す圧縮手法です。

例えば DNA は `A`、`T`、`G`、`C` の 4 つの文字からなる文字列として表現されます。文字の連続した出現を省略して連続する回数を示すようにすると、 `AAAAATTTGCCCCCCA` （16 文字）は `A5T3G1C6A1` （10 文字）のように表現でき、どの文字も同じビット数で表すなら圧縮率は $62.5 \%$ となります。

ランレングス法は各ピクセルが白または黒のモノクロ画像の圧縮にも用いられます。

## ハフマン法

**ハフマン法**は、出現頻度の高いデータを短いビットに、出現頻度の低いデータを短いビット列にして表現する圧縮手法です。

例えば `A = 00`、`T = 01`、`G = 10`、`C = 11` というようにビット列を割り当てるとき、`AAAATGGC` という文字列は `0000000001101011` （16 ビット）と表されます。代わりに `A = 0`、`T = 110`、`G = 10`、`C = 111` というようにビット列を割り当てるようにすると、この文字列は `00001101010111`（14 ビット）と表せます。このときの圧縮率は $87.5 \%$ です。
