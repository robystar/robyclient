Ext.define('tristate.Plugin', {
 init : function(view) {
  view.updateParent = function(node) {
   if (node != null) {
    var tristate = -1;
    node.eachChild(function(rec) {
     var siblingTristrate = rec.get('tristate');
     if (tristate == -1) {
      tristate = siblingTristrate;
     } else {
      if (siblingTristrate != tristate) {
       tristate = 2;
       return false;
      }
     }
    });
    if (tristate != -1) {
     node.set('tristate', tristate);
    }
    this.updateParent(node.parentNode);
   }
  };
  view.onCheckboxChange = function(e, t) {
   var item = e.getTarget(this.getItemSelector(), this.getTargetEl()), record, value, newValue;
   if (item) {
    record = this.getRecord(item);
    value = record.get('tristate');
    newValue = value == 0 ? 1 : 0;
    var shouldContinue=this.fireEvent('beforetristate', record, newValue);
    if (shouldContinue){
     var affectedRecords=[];
     record.cascadeBy(function(rec) {
      rec.set('tristate', newValue);
      affectedRecords[affectedRecords.length]=rec;
     });
     record.set('tristate', newValue);
     this.updateParent(record.parentNode);
     this.fireEvent('tristate', record, newValue, affectedRecords);
    }
   }
  };
  view.setTristate = function(record, value) {
   record.cascadeBy(function(rec) {
    rec.set('tristate', value);
   });
   record.set('tristate', value);
   this.updateParent(record.parentNode);
  };
  view.setAllTristate = function(status) {
   this.getStore().each(function(rec) {
    rec.cascadeBy(function(rec) {
     rec.set('tristate', status);
    });
   }, true);
  };
  view.getChecked = function() {
   this.getChecked(false);
  };
  view.getChecked = function(partialMeansChecked) {
   var checked = [];
   this.node.cascadeBy(function(rec) {
    var ts = rec.get('tristate');
    if (ts > 0 && (partialMeansChecked || ts == 1)) {
     checked.push(rec);
    }
   });
   return checked;
  };
  view.getCheckedLeafs = function() {
   var checked = [];
   this.node.cascadeBy(function(rec) {
    if (rec.isLeaf() && rec.get('tristate') > 0) {
     checked.push(rec);
    }
   });
   return checked;
  };
 }
});
Ext.define('tristate.Column', {
 extend : 'Ext.grid.column.Column',
 alias : 'widget.tristatetreecolumn',
 initComponent : function() {
  var origRenderer = this.renderer || this.defaultRenderer, origScope = this.scope || window;
  this.renderer = function(value, metaData, record, rowIdx, colIdx, store, view) {
   var buf = [], format = Ext.String.format, depth = record.getDepth(), treePrefix = Ext.baseCSSPrefix + 'tree-', elbowPrefix = treePrefix + 'elbow-', expanderCls = treePrefix + 'expander', imgText = '<img src="{1}" class="{0}" />', checkboxText = '<input type="button" role="checkbox" class="{0}" {1} />', formattedValue = origRenderer.apply(origScope, arguments), href = record
     .get('href'), target = record.get('hrefTarget'), cls = record.get('cls');
   while (record) {
    if (!record.isRoot() || (record.isRoot() && view.rootVisible)) {
     if (record.getDepth() === depth) {
      buf.unshift(format(imgText, treePrefix + 'icon ' + treePrefix + 'icon' + (record.get('icon') ? '-inline ' : (record.isLeaf() ? '-leaf ' : '-parent ')) + (record.get('iconCls') || ''), record.get('icon') || Ext.BLANK_IMAGE_URL));
      var tristate = record.get('tristate');
      if (tristate != null) {
       buf.unshift(format(checkboxText, (treePrefix + 'checkbox') + (tristate == 1 ? ' ' + treePrefix + 'checkbox-checked' : (tristate == 2 ? ' ' + treePrefix + 'checkbox-partial-checked' : '')), record.get('checked') ? 'aria-checked="true"' : ''));
       if (tristate > 0) {
        metaData.tdCls += (' ' + Ext.baseCSSPrefix + 'tree-checked');
       }
      }
      if (record.isLast()) {
       if (record.isLeaf() || (record.isLoaded() && !record.hasChildNodes())) {
        buf.unshift(format(imgText, (elbowPrefix + 'end'), Ext.BLANK_IMAGE_URL));
       } else {
        buf.unshift(format(imgText, (elbowPrefix + 'end-plus ' + expanderCls), Ext.BLANK_IMAGE_URL));
       }
      } else {
       if (record.isLeaf() || (record.isLoaded() && !record.hasChildNodes())) {
        buf.unshift(format(imgText, (treePrefix + 'elbow'), Ext.BLANK_IMAGE_URL));
       } else {
        buf.unshift(format(imgText, (elbowPrefix + 'plus ' + expanderCls), Ext.BLANK_IMAGE_URL));
       }
      }
     } else {
      if (record.isLast() || record.getDepth() === 0) {
       buf.unshift(format(imgText, (elbowPrefix + 'empty'), Ext.BLANK_IMAGE_URL));
      } else if (record.getDepth() !== 0) {
       buf.unshift(format(imgText, (elbowPrefix + 'line'), Ext.BLANK_IMAGE_URL));
      }
     }
    }
    record = record.parentNode;
   }
   if (href) {
    formattedValue = format('<a href="{0}" target="{1}">{2}</a>', href, target, formattedValue);
   }
   if (cls) {
    metaData.tdCls += ' ' + cls;
   }
   return buf.join("") + formattedValue;
  };
  this.callParent(arguments);
 },
 defaultRenderer : function(value) {
  return value;
 }
});