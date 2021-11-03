<template>
    <div :class="$style.root" :level="layout.level">
        <div :class="$style.subHeader" v-if="!hiddenHeader">
            <span>{{ schema.alias }}</span>
        </div>
        <div :class="$style.subBody">
            <slot></slot>
            <div v-if="layout.isDynamicLayoutType">
                <el-button type="primary" @click="handleAddLine">添加一条</el-button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ss-form-schema-group',
    props: {
        hiddenHeader: Boolean,
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
        handleAddLine() {
            this.layout.addChildLayout();
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
