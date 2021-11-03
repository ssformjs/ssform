<template>
    <div :class="$style.root" :level="layout.level">
        <div :class="$style.subHeader">
            <template v-if="!isView">
                <span style="float: left; color: #999;">第 {{ layout.index + 1 }} 组</span>
                <el-link @click="subArrayRemoveItem(layout.index)">删除</el-link>
            </template>
        </div>
        <div :class="$style.subBody">
            <slot>
                <span size="big" style="color: red;">System Error!!!</span>
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ss-form-schema-group',
    props: {
        layout: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
        };
    },
    computed: {
        isEdit() {
            return this.type === 'edit';
        },
        isView() {
            return this.type === 'view';
        },
        schema() {
            const layout = this.layout || {};
            return layout.schema;
        },
    },
    methods: {
        subArrayRemoveItem(index) {
            if (this.layout.parent) {
                this.layout.parent.removeChildLayout(index);
            }
        },
    },
};
</script>

<style module>
.root {
    position: relative;
}
.subBody {
    position: relative;
    padding: 5px 10px 0;
    border: solid 1px #ccc;
}
.subHeader {
    position: relative;
    text-align: right;
    overflow: hidden;
    padding: 10px;
    background: rgb(80, 138, 226, 0.2);
    margin-bottom: 10px;
}
</style>
