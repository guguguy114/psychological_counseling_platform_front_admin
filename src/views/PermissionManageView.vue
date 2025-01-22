<template>
    <div>
        <tree-transfer :title="title" :from_data='fromData' :to_data='toData' :defaultProps="{ label: 'label' }"
            @add-btn='add' @remove-btn='remove' :mode='mode' height='540px' :filter="filter" openAll>
        </tree-transfer>
    </div>
</template>

<script>
import treeTransfer from 'el-tree-transfer' // 引入
export default {
    name: 'PermissionManageView',
    data() {
        return {
            title: ['未拥有权限', '已拥有权限'],
            fromData: [

                {
                    id: "1",
                    pid: 0,
                    label: "一级 1",
                    children: [
                        {
                            id: "1-1",
                            pid: "1",
                            label: "二级 1-1",
                            children: []
                        },
                        {
                            id: "1-2",
                            pid: "1",
                            label: "二级 1-2",
                            children: [
                                {
                                    id: "1-2-1",
                                    pid: "1-2",
                                    children: [],
                                    label: "二级 1-2-1"
                                },
                                {
                                    id: "1-2-2",
                                    pid: "1-2",
                                    children: [],
                                    label: "二级 1-2-2"
                                }
                            ]
                        }
                    ]
                }

            ],
            toData: [],
            mode: 'transfer',
            filter: {
                fn: (node, parent) => {
                    if (!parent) return true
                    return node.label.indexOf(this.filterText) !== -1
                },
                keywords: ''
            }
        }
    },
    components: {
        treeTransfer
    },
    methods: {
        add(fromData, toData, obj) {
            console.log(fromData, toData, obj)
        },
        remove(fromData, toData, obj) {
            console.log(fromData, toData, obj)
        }
    }
}
</script>

<style></style>