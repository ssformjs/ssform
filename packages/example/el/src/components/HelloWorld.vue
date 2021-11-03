<template>
  <div :class="$style.root">
    <div :class="$style.left">
      <div :class="$style.monacoSchema">
        <div :class="$style.title">Schema</div>
        <div ref="monacoSchemaRef" style="height:100%;"></div>
      </div>
      <div :class="$style.monacoData">
        <div :class="$style.title">Result Data</div>
        <div ref="monacoDataRef" style="height:100%;"></div>
      </div>
    </div>
    <div :class="$style.right">
      <FormComp ref="schemaFormRef" :value="data" :schema="schema"></FormComp>
      <el-button @click="handleOk">OK</el-button>
    </div>
  </div>
</template>

<script>
import * as monaco from 'monaco-editor';
import schemaTestData from './schemaTestData.js';
import FormComp from './comp/form2.js';
export default {
  name: 'HelloWorld',
  components: { FormComp },
  data() {
    return {
      data: {
        "lookbackDuration": "wewe",
        "breakDuration": "dddd",
        "response": {
            "code": "ccc",
            "headers": {
                "33": "333"
            },
            "body": "cc"
        },
      },
      schema: schemaTestData,
      monacoDataEditor: null,
      monacoSchemaEditor: null,
    };
  },
  methods: {
    handleOk() {
      const data = this.$refs.schemaFormRef.getValue();
      this.monacoDataEditor.setValue(JSON.stringify(data, null, 4));
      this.data = data;
      console.info(JSON.stringify(this.data, null, 4));
    },
    createMonaco(el, key) {
      const monacoEditor = monaco.editor.create(el, {
        value: JSON.stringify(this[key], false, 4),
        language: "json",
        folding: true, // 是否折叠
        foldingHighlight: true, // 折叠等高线
        foldingStrategy: 'auto', // 折叠方式  auto | indentation
        showFoldingControls: 'always', // 是否一直显示折叠 always | mouseover
        disableLayerHinting: true, // 等宽优化
        emptySelectionClipboard: false, // 空选择剪切板
        selectionClipboard: false, // 选择剪切板
        automaticLayout: true, // 自动布局
        codeLens: false, // 代码镜头
        scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
      });
      // 编辑 监听内容变化
      monacoEditor.onDidChangeModelContent(() => {
        // console.log('目前内容为：', monacoEditor.getValue())
        let v = {};
        try {
          v = JSON.parse(monacoEditor.getValue());
        } catch (error) { 
          // ignore
        }
        this.$set(this, key, v);
        this.$nextTick(() => {
          this.$refs.schemaFormRef.refresh();
        });
      })
      return monacoEditor;
    },
  },
  mounted() {
    this.monacoDataEditor = this.createMonaco(this.$refs.monacoDataRef, 'data');
    this.monacoSchemaEditor = this.createMonaco(this.$refs.monacoSchemaRef, 'schema');
  },
}
</script>

<style module>
.root {
  position: relative;
  display: flex;
  flex-direction: row;
  height: 100%;
}
.left {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 50%;
  min-height: 100%;
  border: solid 1px #cccccc;
}
.monacoData {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 30%;
}
.monacoSchema {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 70%;
}
.monaco:not(:first-child) {
  border-top: solid 1px #cccccc;
}
.right {
  position: relative;
  flex: 1 1 auto;
  width: 50%;
  padding: 10px;
  overflow: auto;
}
/* .right::before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-left: solid 1px #cccccc;
} */
.title {
  background: rgb(80, 138, 226, 0.2);
  padding: 6px;
}
</style>
