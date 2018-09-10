function clone(obj){
  return JSON.parse(JSON.stringify(obj));
}

// Patch the same methods as Vue
var arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

// Hugely inspired by VueJS source code :)
function wrap(obj, k, commit, val) {
  var property = Object.getOwnPropertyDescriptor(obj, k);
  if(property && property.configurable === false) {
    return
  }
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 3) {
    val = obj[k];
  }
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      return getter ? getter.call(obj) : val
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      commit();
    }
  });
  return getter ? getter.call(obj) : val;
}

function inject(obj, commit) {
  if(Array.isArray(obj)) {
    arrayMethodsToPatch.forEach(function(name) {
      (
        function(name, oldFunc) {
          //No need to check added / deleted value, since it will be called again to update (out of the scope of this module)
          obj[name] = function() {
            oldFunc.apply(this, arguments);
            commit();
          };
        }(name, obj[name])
      ); 
    });
    obj.forEach(function(v, i) {
      inject(obj[i], commit);
    });
  }
  else if(typeof obj === 'object') {
    Object.keys(obj).forEach(function(k) {
      var c = wrap(obj, k, commit);
      if(c) {
        inject(c, commit);
      }
    });
  }
}

function commit(f, root){
  var this$1 = this;

  return function () {
    f.call(this$1, root);
  }
}

function vueDataProxy(maps) {
  var res = {};
  Object.keys(maps).forEach(function(k) {
    var p = maps[k];
    res[k] = {
      get: function get() {
        var obj = clone(p.fetch.call(this));
        inject(obj, commit.call(this, p.commit,obj));
        return obj;
      },
      set: function set(oldVal, val) {
        p.commit(val);
      }
    };
  });
  return res;
}

export default vueDataProxy;
