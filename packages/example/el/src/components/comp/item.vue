<template>
    <el-form-item :label="schema.alias" :level="layout.level" :key="layout.key">
        <el-input v-if="schema.type === 'input'" v-model="layout.data"></el-input>
        <span v-else>{{ schema.type }}</span>
    </el-form-item>
</template>

<script>
export default {
    name: 'ss-form-schema-item',
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
        size() {
            // 可根据 level 变换
            const level = this.level;
            const arrs = [ 'full', 'huge', 'large', 'medium', 'normal', 'small' ];
            return `large ${arrs[level] || 'small'}`;
        },
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
        hasChildren() {
            return this.layout.layouts && Array.isArray(this.layout.layouts);
        },
        layoutRules() {
            const layout = this.layout || {};
            return layout.rules || [];
        },
    },
    methods: {
    },
};
</script>

<style module>
.root {
    position: relative;
    margin-bottom: 20px;
}
.warpper {
    position: relative;
}
.box {
    position: relative;
    padding: 10px 40px 40px 20px;
    border: 1px dashed #ccc;
}
.boxArray {
    position: relative;
}
.boxArray[border] {
    border: 1px dashed #ccc;
}
.boxFooter {
    margin: 10px 0px;
}
.boxFooter[hasData] {
    margin: 10px 20px;
}
.subItem {
    position: relative;
    padding: 10px 40px 40px 20px;
}
.subHeader {
    position: relative;
    text-align: right;
    overflow: hidden;
    padding: 10px;
    background: rgb(80, 138, 226, .2);
}

.ace { width: 200px; max-width: 100%; }
.ace[size$="mini"] { width: 80px; }
.ace[size$="small"] { width: 120px; }
.ace[size$="normal"] { width: 160px; }
.ace[size$="medium"] { width: 280px; }
.ace[size$="large"] { width: 440px; }
.ace[size$="huge"] { width: 580px; }
.ace[size$="full"] { width: 600px; }

.multiSelect[size$="full"] { width: 100%; }
</style>
