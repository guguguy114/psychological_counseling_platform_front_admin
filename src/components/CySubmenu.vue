<template>
    <!-- 有子菜单 -->
    <el-submenu :index="menuItem.menuId + ''" v-if="menuItem.childrenMenu.length !== 0">
        <template slot="title">
            <i class="el-icon-setting"></i>
            <span>{{ menuItem.menuName }}</span>
        </template>

        <template v-for="(item) in menuItem.childrenMenu">
            <cy-submenu :menu-item="item" :key="item.menuId"></cy-submenu>
        </template>
    </el-submenu>

    <!-- 没有子菜单 -->
    <el-menu-item :index="menuItem.menuUrl !== undefined ? '/main' + menuItem.menuUrl : '/main/404'" v-else>
        <i class="el-icon-setting"></i>
        <span slot="title">{{ menuItem.menuName }}</span>
    </el-menu-item>
</template>



<script>
export default {
    name: 'CySubmenu',
    props: {
        menuItem: {
            type: Object,
            default: () => {}
        }
    },
    created() {
    }
}
</script>

<style></style>