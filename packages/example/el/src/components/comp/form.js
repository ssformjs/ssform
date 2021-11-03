import { FormSchema } from '@ssform/core';
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
      render(_h, l, c) {
        if (l.isRoot) {
          return _h('el-form', {
            key: l.uuid,
            // on: this.$listeners,
            // props: this.$attrs,
          }, c);
        } else if (l.isGroup) {
            let item = c;
            if (l.isDynamicLayoutType) {
                item = c.length > 0 ? c.map((itemC, index) => {
                    const layout = [...l.layouts][index];
                    return _h(ArrayComp, {
                        key: layout.uuid,
                        props: {
                            layout,
                        }, 
                    }, [ itemC ]);
                }) : null;
            }
            return _h(GroupComp, {
                key: l.uuid,
                props: {
                    layout: l,
                    hiddenHeader: l.parent.isDynamicLayoutType,
                }, 
            }, item);
        }
        return _h(ItemComp, {
          key: l.uuid,
          props: {
            layout: l,
          },
        }, c);
      },
      refresh(isFirst) {
        if (this.schemaForm) {
          this.schemaForm.destroy();
          this.schemaForm = null;
        }
        this.schemaForm = new FormSchema({
          ...this.schema,
        }, this.value, {
            render: this.render,
            update: this.$forceUpdate.bind(this),
        }).create();
        if (!isFirst) {
          this.$nextTick(() => {
            this.$forceUpdate();
          });
        }
      },
      getValue() {
        return this.schemaForm.formatValue;
      },
  },
  created() {
    // console.info('this.value', this.value);
    this.refresh(true);
  },
  render(h) {
    const a = this.schemaForm.render(h);
    return a;
  },
};
