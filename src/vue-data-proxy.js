
import * as utils from './utils.js'

// Patch the same methods as Vue
const arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

// Hugely inspired by VueJS source code :)
function wrap(obj, k, commit, val) {
  const property = Object.getOwnPropertyDescriptor(obj, k)
  if(property && property.configurable === false) {
    return
  }
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 3) {
    val = obj[k]
  }
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      return getter ? getter.call(obj) : val
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      commit();
    }
  })
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
      const c = wrap(obj, k, commit)
      if(c) {
        inject(c, commit)
      }
    });
  }
}

function commit(f, root){
  return () => {
    f.call(this, root);
  }
}

export default function vueDataProxy(maps) {
  const res = {};
  Object.keys(maps).forEach(function(k) {
    const p = maps[k];
    res[k] = {
      get() {
        const obj = utils.clone(p.fetch.call(this));
        inject(obj, commit.call(this, p.commit,obj));
        return obj;
      },
      set(val) {
        p.commit.call(this, val);
      }
    }
  });
  return res;
}
