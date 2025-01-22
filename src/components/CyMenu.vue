<template>
    <!-- default-active默认选中 -->
    <el-menu default-active="" class="el-menu-vertical" @open="handleOpen" :router="elUseRouter" a
        @close="handleClose">
        
        <template v-for="(item) in this.menuList">
            <cy-submenu :menu-item="item" :key="item.menuId"></cy-submenu>
        </template>
    </el-menu>
</template>

<script>
import CySubmenu from '@/components/CySubmenu'

export default {
    name: 'CyMenu',
    props: {
        menuList: {
            type: Array,
            default: () => []
        }
    },
    components: {
        CySubmenu
    },
    data() {
        return {
            elUseRouter: true,
        }
    },
    methods:{
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        }
    },
    created() {
        
    }
}
</script>

<style>

</style>