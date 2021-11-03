import { SimpleSchema } from '@ssform/simple';
import ItemComp from './item';
import GroupComp from './group';
import ArrayComp from './array';
export default {
  name: 'ss-form-schema-form',
  props: {
    schema: {
        type: Object,
        required: true,
    },
    value: Object,
  },
  data() {
      return {
          schemaForm: null,
      };
  },
  methods: {
      getValue() {
        return this.schemaForm.formatValue;
      },
  },
  created() {
    console.info('this.value', this.value);
    this.schemaForm = new SimpleSchema({
      ...this.schema,
    }, this.value, {
        renderRoot: (_h, l, c) => {
          return _h('el-form', {
            key: l.uuid,
            // on: this.$listeners,
            // props: this.$attrs,
          }, c);
        },
        renderGroup: (_h, l, c) => {
            return _h(GroupComp, {
                key: l.uuid,
                props: {
                    layout: l,
                }, 
            }, c);
        },
        renderGroupItem: (_h, l, c) => {
          return _h(ItemComp, {
            key: l.uuid,
            props: {
              layout: l,
            },
          }, c);
        },
        renderDynamicGroup: (_h, l, c) => {
            return _h(GroupComp, {
                key: l.uuid,
                props: {
                    layout: l,
                    hiddenHeader: true,
                }, 
            }, c);
        },
        renderDynamicGroupLayout: (_h, l, c) => {
            return _h(ArrayComp, {
                key: l.uuid,
                props: {
                    layout: l,
                }, 
            }, c);
        },
        update: this.$forceUpdate.bind(this),
    }).create();
  },
  render(h) {
    return this.schemaForm.render(h);
  },
};
