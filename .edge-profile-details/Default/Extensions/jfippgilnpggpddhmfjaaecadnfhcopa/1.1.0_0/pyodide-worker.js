(()=>{var k="/user";function C(e){if(e==null)throw new Error("Invalid file name: missing");let t=String(e);if(t.length===0)throw new Error("Invalid file name: empty");if(t.length>255)throw new Error("Invalid file name: too long");if(t==="."||t==="..")throw new Error("Invalid file name: reserved");if(t.includes("/")||t.includes("\\"))throw new Error("Invalid file name: path separators are not allowed");if(t.includes(".."))throw new Error("Invalid file name: traversal sequences are not allowed");for(let r=0;r<t.length;r+=1){let s=t.charCodeAt(r);if(s===0||s<32||s===127)throw new Error("Invalid file name: control characters are not allowed")}return t}function S(e){let t=C(e);return`${k}/${t}`}function $(e){if(!e)throw new Error("FS is required");try{let t=e.stat(k);if(typeof e.isDir=="function"&&!e.isDir(t.mode))throw new Error(`${k} exists and is not a directory`)}catch{e.mkdir(k)}}function J(e,t,r,s){let i=S(t);return e.writeFile(i,r,s)}function V(e,t){let r=S(t);return e.unlink(r)}var Y={USER_DIR:k,normalizeUserFileName:C,userPathForName:S,ensureUserDir:$,writeUserFile:J,deleteUserFile:V};typeof globalThis<"u"&&(globalThis.PPWWorkerFS=Y);var A=globalThis.PPWWorkerFS,W="v0.27.5",D=`
import sys, io, mimetypes, os
mimetypes.init()

# Enable HTTP support using pyodide-http
import micropip
await micropip.install("pyodide-http")

import pyodide_http
pyodide_http.patch_all()

# Wait for the Emscripten fetch module to be ready
import urllib3.contrib.emscripten.fetch as fetch_module
await fetch_module.wait_for_streaming_ready()

# Patch requests.Response.json to handle large JSON responses
import requests, json
from requests.models import Response

def enhanced_json(self, **kwargs):
    if not self.content:
        return None
    try:
        return json.loads(self.content.decode("utf-8"), **kwargs)
    except json.JSONDecodeError as error:
        raise requests.exceptions.JSONDecodeError(
            message=str(error),
            doc=self.content.decode("utf-8"),
            pos=error.pos
        )

Response.json = enhanced_json

# Ensure user directory is on sys.path for local module imports
if '/user' not in sys.path:
    sys.path.insert(0, '/user')

# Keep root on sys.path for compatibility, but prefer /user
if '/' not in sys.path:
    sys.path.append('/')

# Prefer /user as current working directory (best effort)
try:
    os.chdir('/user')
except Exception:
    pass
`,R=null,n=null,B="Input:",a=null,p=null,P=!1,w=null,I=0,O=null,T=null,E=Object.freeze({STEP_INTO:1,STEP_OVER:2,STEP_OUT:5,RESUME:3,STOP:4,INSPECT_CHILDREN:10,INSPECT_REPR:11,INSPECT_LOCALS_PAGE:12}),_=Object.freeze({FLAG_INDEX:0,CMD_INDEX:1,ARG0_INDEX:2,ARG1_INDEX:3}),K=Object.freeze({UPDATE_STATE_INDEX:0,LINES_COUNT_INDEX:1,FILENAME_LEN_BYTES_INDEX:2,RESERVED_INDEX:3,FILENAME_BYTES_OFFSET_BYTES:16,FILENAME_MAX_BYTES:256,LINES_OFFSET_BYTES:272,LINES_OFFSET_INDEX:68,MAX_LINES:100}),Q=Object.freeze({IDLE:0,READY:1,WRITING:2}),d=Object.freeze({MAX_REPR_CHARS:400,MAX_LOCALS:400,MAX_CHILDREN:200,MAX_FULL_REPR_CHARS:2e4}),y=A?.USER_DIR||"/user",Z=new TextDecoder("utf-8");function h(e){return typeof SharedArrayBuffer>"u"?!1:Object.prototype.toString.call(e)==="[object SharedArrayBuffer]"}function q(e){if(!Array.isArray(e))return[];let t=new Set;for(let r of e){let s=Number(r);!Number.isInteger(s)||s<1||t.add(s|0)}return Array.from(t).sort((r,s)=>r-s)}function M(e){if(typeof e!="string")return null;let t=e.trim().replace(/\\/g,"/");if(!t)return null;let r=t;r.startsWith(`${y}/`)?r=r.slice(y.length+1):r.startsWith("user/")&&y==="/user"?r=r.slice(5):r=r.replace(/^\/+/,"");let s=[];for(let i of r.split("/"))if(!(!i||i===".")){if(i===".."){s.pop();continue}s.push(i)}return s.length===0?null:`${y}/${s.join("/")}`}function ee(e,t){let r={};if(e&&typeof e=="object"&&!Array.isArray(e))for(let[s,i]of Object.entries(e)){let o=M(s);o&&(r[o]=q(i))}return t&&!r[t]&&(r[t]=[]),r}function N(){a&&(Atomics.store(a,_.ARG1_INDEX,0),Atomics.store(a,_.ARG0_INDEX,0),Atomics.store(a,_.CMD_INDEX,0),Atomics.store(a,_.FLAG_INDEX,0))}self.getDebugCommand=()=>{try{if(!a||(Atomics.load(a,_.FLAG_INDEX)|0)!==1)return 0;let t=Atomics.load(a,_.CMD_INDEX)|0;return t===E.INSPECT_CHILDREN||t===E.INSPECT_REPR||t===E.INSPECT_LOCALS_PAGE?0:(N(),t)}catch{return 0}};self.getDebugInspectRequest=()=>{try{if(!a||(Atomics.load(a,_.FLAG_INDEX)|0)!==1||(Atomics.load(a,_.CMD_INDEX)|0)!==E.INSPECT_CHILDREN)return 0;let r=Atomics.load(a,_.ARG0_INDEX)|0;return I=Atomics.load(a,_.ARG1_INDEX)|0,N(),r}catch{return 0}};self.getDebugInspectChildrenOffset=()=>{let e=I|0;return I=0,e>=0?e:0};self.getDebugInspectReprRequest=()=>{try{if(!a||(Atomics.load(a,_.FLAG_INDEX)|0)!==1||(Atomics.load(a,_.CMD_INDEX)|0)!==E.INSPECT_REPR)return 0;let r=Atomics.load(a,_.ARG0_INDEX)|0;return N(),r}catch{return 0}};self.getDebugLocalsRequest=()=>{try{if(!a||(Atomics.load(a,_.FLAG_INDEX)|0)!==1||(Atomics.load(a,_.CMD_INDEX)|0)!==E.INSPECT_LOCALS_PAGE)return-1;let r=Atomics.load(a,_.ARG0_INDEX)|0;return N(),r>=0?r:-1}catch{return-1}};self.getUpdatedBreakpointsUpdate=()=>{try{if(!p)return null;let{UPDATE_STATE_INDEX:e,LINES_COUNT_INDEX:t,FILENAME_LEN_BYTES_INDEX:r,FILENAME_BYTES_OFFSET_BYTES:s,FILENAME_MAX_BYTES:i,LINES_OFFSET_INDEX:o,MAX_LINES:u}=K,{IDLE:c,READY:b}=Q;if((Atomics.load(p,e)|0)!==b)return null;let x=Math.max(0,Math.min(u,p.length-o)),m=Atomics.load(p,t)|0;m<0&&(m=0),m>x&&(m=x);let g=Atomics.load(p,r)|0;g<0&&(g=0),g>i&&(g=i);let l=[];for(let v=0;v<m;v+=1)l.push(Atomics.load(p,o+v)|0);let G=new Uint8Array(p.buffer,p.byteOffset,p.byteLength).slice(s,s+g),H=Z.decode(G),L=M(H);return Atomics.store(p,e,c),L?[L,q(l)]:null}catch{return null}};async function X(e,t){let r=(Array.isArray(t)?t:[]).map(o=>({name:o.name,version:o.version||"latest"})),s=JSON.stringify(r).replace(/false/g,"False").replace(/true/g,"True"),i=await n.runPythonAsync(`
import micropip
import sys
import importlib
import asyncio
from importlib.metadata import version, distribution, PackageNotFoundError
from pyodide.code import find_imports
from pyodide.ffi import to_js
import os

# Optional: try to use packaging for version parsing
try:
    from packaging.version import parse as parse_version
except Exception:
    parse_version = None

IMPORT_TO_PACKAGE_MAP = {
    'PIL': 'Pillow',
    'bs4': 'beautifulsoup4',
    'cv2': 'opencv-python',
    'yaml': 'pyyaml',
    'ruamel': 'ruamel.yaml',
    'pylan': 'pylan-lib',
    'dateutil': 'python-dateutil',
    'dotenv': 'python-dotenv',
    'sklearn': 'scikit-learn',
    'skimage': 'scikit-image',
    'Crypto': 'pycryptodome',
}

# Modules that are part of the runtime and must not be auto-installed
EXCLUDED_IMPORTS = {'pyodide'}

def safe_get_top_level(pkg_name):
    """Try to get list of top-level modules for distribution pkg_name.
       Returns list (possibly empty) \u2014 never throws."""
    try:
        dist = distribution(pkg_name)
        txt = dist.read_text('top_level.txt')
        if not txt:
            return []
        return [ln.strip() for ln in txt.splitlines() if ln.strip()]
    except PackageNotFoundError:
        # package not installed \u2014 return empty list
        return []
    except Exception as e:
        return []

def collect_modules_to_remove(top_level_modules):
    """Collect list of keys in sys.modules to remove."""
    to_delete = []
    mods = list(sys.modules.keys())
    for m in mods:
        for name in top_level_modules:
            if m == name or m.startswith(name + "."):
                to_delete.append(m)
    # remove duplicates and sort by key length in descending order,
    # to delete deeper submodules first (although pop doesn't require it)
    to_delete = sorted(set(to_delete), key=lambda x: -len(x))
    return to_delete

def remove_package_modules_by_top_level(top_level_modules):
    to_delete = collect_modules_to_remove(top_level_modules)
    for m in to_delete:
        try:
            sys.modules.pop(m, None)
        except Exception as e:
            pass
    # Invalidate import caches
    try:
        importlib.invalidate_caches()
    except Exception:
        pass

async def manage_packages(code, packages):
    """
    code: string with code to analyze imports
    packages: list of dict {'name': <PyPI-name>, 'version': <ver or 'latest'>}
    """
    import time
    
    # serialize: don't run in parallel (simple guard)
    last_run = getattr(manage_packages, "_last_run", 0)
    current_time = time.time()
    
    # Reset if stuck for more than 30 seconds
    if getattr(manage_packages, "_busy", False):
        if current_time - last_run > 30:
            manage_packages._busy = False
        else:
            raise RuntimeError("manage_packages already running")
    
    manage_packages._busy = True
    manage_packages._last_run = current_time
    try:
        stdlib = set(sys.stdlib_module_names)
        # detect local modules
        try:
            local_modules_all = { fn[:-3] for fn in os.listdir('/user') if fn.endswith('.py') }
        except Exception:
            local_modules_all = set()
      
        def safe_read(path):
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            except Exception:
                return ''
      
        def top_level_imports_from_source(src):
            mods = set()
            try:
                for imp in find_imports(src or ""):
                    if imp:
                        mods.add(imp.split('.')[0])
            except Exception:
                pass
            return mods
      
        # Start from the current code's imports
        initial_imports = top_level_imports_from_source(code or "")
        # Traverse only reachable local modules
        reachable_local_modules = set()
        queue = [m for m in initial_imports if m in local_modules_all]
        while queue:
            mod = queue.pop()
            if mod in reachable_local_modules:
                continue
            reachable_local_modules.add(mod)
            src = safe_read(f"/user/{mod}.py")
            deps = top_level_imports_from_source(src)
            # enqueue local deps
            for d in deps:
                if d in local_modules_all and d not in reachable_local_modules:
                    queue.append(d)
      
        # Union of imports from main code and all reachable local modules' sources
        found_imports = set(initial_imports)
        for mod in list(reachable_local_modules):
            src = safe_read(f"/user/{mod}.py")
            found_imports |= top_level_imports_from_source(src)
      
        # External modules to consider for installation
        import_modules = [ m for m in {m.split('.')[0] for m in found_imports}
                           if m not in stdlib and m not in reachable_local_modules and m not in EXCLUDED_IMPORTS ]
        import_packages = list({ IMPORT_TO_PACKAGE_MAP.get(m, m) for m in import_modules })

        # req_dict: name -> requested_version
        req_dict = { pkg['name']: pkg.get('version', 'latest') for pkg in packages }

        # candidates: all package names to consider (imports + explicit)
        candidates = set(req_dict.keys()) | set(import_packages)

        # get currently installed versions
        installed = {}
        for c in candidates:
            try:
                installed[c] = version(c)
            except Exception:
                installed[c] = None

        # Determine uninstall/install lists
        to_uninstall = []
        to_install = {}  # map name -> (install_spec, install_error)

        # handle explicit packages (not imported) first
        for pkg, requested in req_dict.items():
            cur = installed.get(pkg)
            mismatch = False
            if cur and requested != 'latest':
                if parse_version:
                    try:
                        if parse_version(str(cur)) != parse_version(str(requested)):
                            mismatch = True
                    except Exception:
                        mismatch = (str(cur) != str(requested))
                else:
                    mismatch = (str(cur) != str(requested))
            if cur is None:
                spec = pkg if requested == 'latest' else f"{pkg}=={requested}"
                to_install[pkg] = (spec, {})
            elif mismatch:
                to_uninstall.append(pkg)
                spec = f"{pkg}=={requested}"
                to_install[pkg] = (spec, {})
            elif requested == 'latest':
                to_uninstall.append(pkg)
                to_install[pkg] = (pkg, {})
            else:
                spec = f"{pkg}=={cur}"
                to_install[pkg] = (spec, {})

        # handle imports
        for pkg in import_packages:
            if pkg in req_dict.keys():
                continue
            requested = req_dict.get(pkg, 'latest')
            cur = installed.get(pkg)
            # Compare versions (try packaging if available)
            mismatch = False
            if cur and requested != 'latest':
                if parse_version:
                    try:
                        if parse_version(str(cur)) != parse_version(str(requested)):
                            mismatch = True
                    except Exception:
                        mismatch = (str(cur) != str(requested))
                else:
                    mismatch = (str(cur) != str(requested))
            if cur is None:
                # not installed -> install
                spec = pkg if requested == 'latest' else f"{pkg}=={requested}"
                to_install[pkg] = (spec, {})
            elif mismatch:
                to_uninstall.append(pkg)
                spec = f"{pkg}=={requested}"
                to_install[pkg] = (spec, {})
            else:
                spec = f"{pkg}=={cur}"
                to_install[pkg] = (spec, {})

        # dedupe
        to_uninstall = list(dict.fromkeys(to_uninstall))
        # prepare install order: explicit (not imports) first, then imports
        # but we can just keep given order; optionally sort

        # Gather top_level modules BEFORE uninstall (because after uninstall distribution may be gone)
        modules_to_remove = []
        for pkg in to_uninstall:
            top = safe_get_top_level(pkg)
            if top:
                modules_to_remove.extend(top)
            else:
                # fallback heuristics: try pkg -> module
                fallback = pkg.replace('-', '_')
                modules_to_remove.append(fallback)

        # -------------- UNINSTALL --------------
        if to_uninstall:
            try:
                micropip.uninstall(to_uninstall)
            except Exception as e:
                pass

            # Remove modules from sys.modules based on top_level or heuristics
            try:
                remove_package_modules_by_top_level(modules_to_remove)
            except Exception as e:
                pass

        # -------------- INSTALL --------------
        successfully_imported_modules = []
        for name, (spec, installError) in to_install.items():
            if name in successfully_imported_modules:
                if name in import_packages:
                    import_packages.remove(name)
                continue
            try:
                # install per-package to capture errors
                await micropip.install(spec)
                # try import to confirm import name (discover actual top-level)
                top = safe_get_top_level(name)
                tried = False
                if top:
                    for candidate in top:
                        try:
                            importlib.import_module(candidate)
                            tried = True
                            successfully_imported_modules.append(candidate)
                            break
                        except Exception as imp_e:
                            pass
                if not tried:
                    # fallback: name with dashes->underscores
                    candidate = name.replace('-', '_')
                    try:
                        importlib.import_module(candidate)
                        tried = True
                        successfully_imported_modules.append(candidate)
                    except Exception as imp_e:
                        pass
            except Exception as e:
                to_install[name] = (spec, str(e))

        # Build return result list
        result = []
        seen = set()
        for name in list(import_packages) + list(req_dict.keys()):
            if name in seen:
                continue
            seen.add(name)
            try:
                ver = version(name)
                failed = False
                err = ""
            except Exception as e:
                ver = req_dict.get(name) or 'latest'
                failed = True
                err = to_install[name][1] or str(e)
            result.append({'name': name, 'version': ver, 'installFailed': failed, 
                           'installError': err, 'imported': name in import_packages and name not in req_dict.keys()})

        return result
    finally:
        manage_packages._busy = False

result = await manage_packages(${JSON.stringify(e)}, ${s})
to_js(result)
      `);return Array.from(i).map(o=>({name:o.name,version:o.version,installFailed:o.installFailed,installError:o.installError,imported:o.imported}))}var F=class{constructor(t,r){this.flagView=t,this.textBufferView=r}stdin(){self.postMessage({type:"input",data:{prompt:B}}),Atomics.store(this.flagView,0,0),Atomics.wait(this.flagView,0,0);let t=[];for(let r=0;r<this.textBufferView.length;r++){let s=this.textBufferView[r];if(s===0)break;t.push(s)}return new TextDecoder().decode(new Uint8Array(t))}};self.setGlobalPrompt=e=>{B=e};async function te(e,t){h(e)&&h(t)?(O=new Int32Array(e),T=new Uint8Array(t),await n.runPythonAsync(`
      import builtins
      if not hasattr(builtins, "_input_backup"):
          builtins._input_backup = builtins.input

      def _js_input(prompt=""):
          from js import setGlobalPrompt
          setGlobalPrompt(prompt)
          return builtins._input_backup()

      builtins.input = _js_input
      `),n.setStdin(new F(O,T))):await n.runPythonAsync(`
      import builtins
      def _no_sab_input(prompt=""):
          raise RuntimeError("input() is not supported in this environment (no SharedArrayBuffer/crossOriginIsolated).")

      builtins.input = _no_sab_input
    `)}async function z(){await n.runPythonAsync(`
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import io, base64

    def _capture_figures():
      figures = []
      for num in plt.get_fignums():
        fig = plt.figure(num)
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        encoded = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close(fig)
        figures.append({'data': encoded, 'figure': num})
      return figures

    if not hasattr(plt, '_original_show'):
      plt._original_show = plt.show

    if not hasattr(plt.show, '_patched'):
      def _patched_show(*args, **kwargs):
        from js import postMessage, Object
        from pyodide.ffi import to_js
        for fig in _capture_figures():
          postMessage(to_js({
              'type': 'matplotlib',
              'data': fig
          }, dict_converter=Object.fromEntries))
        return plt._original_show(*args, **kwargs)

      _patched_show._patched = True
      plt.show = _patched_show
  `)}async function U(){await n.runPythonAsync(`
    import plotly.io as pio

    if not hasattr(pio, '_original_show'):
      pio._original_show = pio.show

    def _extract_plot_json(figure):
      return {
        'json': figure.to_json(),
        'figure': id(figure)
      }

    if not hasattr(pio.show, '_patched'):
      def _patched_show(fig, *args, **kwargs):
        from js import postMessage, Object
        from pyodide.ffi import to_js
        data = _extract_plot_json(fig)
        postMessage(to_js({
          'type': 'plotly',
          'data': data
        }, dict_converter=Object.fromEntries))
        return pio._original_show(fig, *args, **kwargs)

      _patched_show._patched = True
      pio.show = _patched_show
  `)}async function re(e){await n.runPythonAsync(`
import sys, bdb, types, inspect, time
from collections.abc import Mapping
from pyodide.ffi import to_js
from js import (
    postMessage,
    Object,
    getDebugCommand,
    getDebugInspectRequest,
    getDebugInspectChildrenOffset,
    getDebugInspectReprRequest,
    getDebugLocalsRequest,
    getUpdatedBreakpointsUpdate,
)

ENTRY_FILE = ${JSON.stringify(e)}
USER_PREFIX = ${JSON.stringify(`${y}/`)}
MAX_REPR_CHARS = ${d.MAX_REPR_CHARS}
MAX_LOCALS = ${d.MAX_LOCALS}
MAX_CHILDREN = ${d.MAX_CHILDREN}
MAX_FULL_REPR_CHARS = ${d.MAX_FULL_REPR_CHARS}

_dbg_registry = {}
_dbg_next_id = 1
_DBG_MISSING = object()
_dbg_active_frame = None

def _dbg_register(obj):
    global _dbg_next_id
    oid = _dbg_next_id
    _dbg_next_id += 1
    _dbg_registry[oid] = obj
    return oid

def _dbg_type_name(obj):
    try:
        return type(obj).__name__
    except Exception:
        return "unknown"

def _dbg_safe_len(obj):
    try:
        return len(obj)
    except Exception:
        return 0

def _dbg_truncate_text(text, max_chars):
    try:
        raw = str(text)
    except Exception:
        raw = "<unrepr>"
    if not isinstance(max_chars, int) or max_chars < 0:
        return raw, False
    if len(raw) <= max_chars:
        return raw, False
    return raw[:max_chars] + "...", True

def _dbg_collection_summary(obj):
    try:
        size = _dbg_safe_len(obj)
    except Exception:
        size = 0
    if isinstance(obj, list):
        return f"list(len={size})"
    if isinstance(obj, tuple):
        return f"tuple(len={size})"
    if isinstance(obj, set):
        return f"set(len={size})"
    if isinstance(obj, Mapping):
        return f"{_dbg_type_name(obj)}(len={size})"
    return None

def _dbg_repr_with_limit(obj, max_chars, prefer_summary=False):
    source = None
    if prefer_summary:
        source = _dbg_collection_summary(obj)
    if source is None:
        try:
            source = repr(obj)
        except Exception:
            try:
                source = str(obj)
            except Exception:
                source = "<unrepr>"
    total_chars = len(source) if isinstance(source, str) else 0
    preview, truncated = _dbg_truncate_text(source, max_chars)
    return preview, bool(truncated), int(total_chars)

def _dbg_preview(obj):
    prefer_summary = _dbg_collection_summary(obj) is not None
    preview, truncated, _ = _dbg_repr_with_limit(obj, MAX_REPR_CHARS, prefer_summary=prefer_summary)
    return preview, truncated

def _dbg_full_repr(oid, max_chars=MAX_FULL_REPR_CHARS):
    obj = _dbg_registry.get(oid, _DBG_MISSING)
    if obj is _DBG_MISSING:
        return {
            "repr": "<missing>",
            "truncated": False,
            "totalChars": 0,
            "sentChars": 0,
        }
    text, truncated, total_chars = _dbg_repr_with_limit(obj, max_chars, prefer_summary=False)
    return {
        "repr": text,
        "truncated": bool(truncated),
        "totalChars": int(total_chars),
        "sentChars": len(text),
    }

def _dbg_unavailable_node(name):
    return {
        "name": str(name),
        "id": _dbg_register(None),
        "type": "unavailable",
        "repr": "<unavailable>",
        "reprTruncated": False,
        "expandable": False,
        "childrenState": "none",
    }

def _dbg_meta(total, sent):
    safe_total = max(0, int(total))
    safe_sent = max(0, int(sent))
    omitted = max(0, safe_total - safe_sent)
    return {
        "total": safe_total,
        "sent": safe_sent,
        "truncated": omitted > 0,
        "omitted": omitted,
    }

def _dbg_key_preview(key):
    try:
        s, _ = _dbg_preview(key)
        return s
    except Exception:
        return "<key>"

def _dbg_expandable(obj):
    if isinstance(obj, Mapping):
        return _dbg_safe_len(obj) > 0
    if isinstance(obj, (list, tuple, set)):
        return _dbg_safe_len(obj) > 0
    if inspect.ismodule(obj):
        return False
    if inspect.isfunction(obj) or inspect.ismethod(obj) or inspect.isbuiltin(obj):
        return False
    if isinstance(obj, (str, bytes, bytearray, memoryview, int, float, complex, bool, range)):
        return False
    if inspect.isclass(obj):
        try:
            return any(not str(name).startswith("__") for name in dir(obj))
        except Exception:
            return False
    if hasattr(obj, "__dict__") and isinstance(obj.__dict__, dict):
        try:
            return any(not str(name).startswith("__") for name in obj.__dict__.keys())
        except Exception:
            return False
    if hasattr(obj, "__dict__"):
        return True
    return False

def _dbg_describe(name, obj):
    try:
        oid = _dbg_register(obj)
    except Exception:
        oid = _dbg_register(None)
        obj = None
    preview, preview_truncated = _dbg_preview(obj) if obj is not None else ("<unavailable>", False)
    expandable = bool(_dbg_expandable(obj)) if obj is not None else False
    return {
        "name": str(name),
        "id": oid,
        "type": _dbg_type_name(obj),
        "repr": preview,
        "reprTruncated": bool(preview_truncated),
        "expandable": expandable,
        "childrenState": "unloaded" if expandable else "none",
    }

def _dbg_snapshot_vars(mapping, offset=0, limit=MAX_LOCALS):
    try:
        normalized_offset = int(offset)
    except Exception:
        normalized_offset = 0
    if normalized_offset < 0:
        normalized_offset = 0

    try:
        normalized_limit = int(limit)
    except Exception:
        normalized_limit = MAX_LOCALS
    if normalized_limit < 0:
        normalized_limit = 0
    if normalized_limit > MAX_LOCALS:
        normalized_limit = MAX_LOCALS

    entries = []
    try:
        for k, v in mapping.items():
            if isinstance(k, str) and k.startswith("__"):
                continue
            entries.append((str(k), v))
    except Exception:
        entries = []

    total_vars = len(entries)
    vars_list = []
    page_entries = entries[normalized_offset:normalized_offset + normalized_limit]
    for k, v in page_entries:
        try:
            vars_list.append(_dbg_describe(k, v))
        except Exception:
            vars_list.append(_dbg_unavailable_node(k))

    return vars_list, _dbg_meta(total_vars, len(vars_list))

def _dbg_children(oid, offset=0, max_items=MAX_CHILDREN):
    limit = MAX_CHILDREN
    try:
        if isinstance(max_items, int):
            limit = max(0, min(max_items, MAX_CHILDREN))
    except Exception:
        limit = MAX_CHILDREN

    normalized_offset = 0
    try:
        if isinstance(offset, int):
            normalized_offset = max(0, offset)
    except Exception:
        normalized_offset = 0

    obj = _dbg_registry.get(oid, _DBG_MISSING)
    if obj is _DBG_MISSING:
        return [], _dbg_meta(0, 0)
    if inspect.ismodule(obj):
        return [], _dbg_meta(0, 0)

    children = []
    total = 0
    try:
        if isinstance(obj, Mapping):
            for k, v in obj.items():
                total += 1
                if total <= normalized_offset:
                    continue
                if len(children) >= limit:
                    continue
                children.append(_dbg_describe(f"[{_dbg_key_preview(k)}]", v))
        elif isinstance(obj, (list, tuple, set)):
            for idx, v in enumerate(obj):
                total += 1
                if total <= normalized_offset:
                    continue
                if len(children) >= limit:
                    continue
                children.append(_dbg_describe(f"[{idx}]", v))
        elif inspect.isclass(obj):
            names = [n for n in dir(obj) if not n.startswith("__")]
            total = len(names)
            for n in names[normalized_offset:normalized_offset + limit]:
                try:
                    children.append(_dbg_describe(n, getattr(obj, n)))
                except Exception:
                    children.append(_dbg_unavailable_node(n))
        elif hasattr(obj, "__dict__") and isinstance(obj.__dict__, dict):
            entries = list(obj.__dict__.items())
            total = len(entries)
            for n, v in entries[normalized_offset:normalized_offset + limit]:
                children.append(_dbg_describe(n, v))
        else:
            names = [n for n in dir(obj) if not n.startswith("__")]
            total = len(names)
            for n in names[normalized_offset:normalized_offset + limit]:
                try:
                    children.append(_dbg_describe(n, getattr(obj, n)))
                except Exception:
                    children.append(_dbg_unavailable_node(n))
    except Exception:
        sent = min(total, normalized_offset + len(children))
        return children, _dbg_meta(total, sent)

    sent = min(total, normalized_offset + len(children))
    return children, _dbg_meta(total, sent)

def _dbg_locals_page_from_active_frame(offset=0, limit=MAX_LOCALS):
    try:
        frame = _dbg_active_frame
    except Exception:
        frame = None
    if frame is None:
        return [], _dbg_meta(0, 0)
    try:
        mapping = frame.f_locals
    except Exception:
        mapping = {}
    return _dbg_snapshot_vars(mapping, offset=offset, limit=limit)

def _coerce_breakpoint_lines(lines):
    normalized = []
    if not isinstance(lines, (list, tuple, set)):
        return normalized
    for value in lines:
        try:
            lineno = int(value)
        except Exception:
            continue
        if lineno < 1:
            continue
        normalized.append(lineno)
    return sorted(set(normalized))

def _normalize_breakpoints_map(raw_map):
    normalized = {}
    if not isinstance(raw_map, Mapping):
        return normalized

    for raw_file, raw_lines in raw_map.items():
        try:
            file_path = str(raw_file)
        except Exception:
            continue
        if not file_path.startswith(USER_PREFIX):
            continue
        normalized[file_path] = _coerce_breakpoint_lines(raw_lines)

    return normalized

def _is_valid_user_filename(filename):
    if not isinstance(filename, str):
        return False
    if not filename.startswith(USER_PREFIX):
        return False
    basename = filename.rsplit("/", 1)[-1]
    if basename.startswith("<") and basename.endswith(">"):
        return False
    return True

class JsControlledDebugger(bdb.Bdb):
    def __init__(self, entry_file):
        super().__init__()
        self._waiting = False
        self._entry_file = entry_file
        self._pause_seq = 0
        self._active_pause_id = 0
        self._breakpoints_by_file = {}
        self._pending_step_out = False
        self._step_out_frame = None

    def _build_user_stack(self, frame):
        stack = []
        cursor = frame
        while cursor is not None:
            if self._is_user_frame(cursor):
                stack.append({
                    "filename": cursor.f_code.co_filename,
                    "lineno": cursor.f_lineno,
                    "function": cursor.f_code.co_name,
                })
            cursor = cursor.f_back
        stack.reverse()
        return stack

    def user_call(self, frame, argument_list):
        if not self._is_user_frame(frame):
            return
        try:
            should_stop = bool(self.stop_here(frame) or self.break_here(frame))
        except Exception:
            should_stop = False
        if not should_stop:
            return
        self._pause(frame)

    def user_line(self, frame):
        if self._is_user_frame(frame):
            self._pause(frame)

    def user_return(self, frame, value):
        if self._pending_step_out and frame is self._step_out_frame:
            self._pending_step_out = False
            self._step_out_frame = None

            caller = frame.f_back
            while caller is not None and not self._is_user_frame(caller):
                caller = caller.f_back

            if caller is None:
                try:
                    self.set_continue()
                except Exception:
                    pass
                return

            self._pause(caller)
            return

        if not self._is_user_frame(frame):
            return
        # Avoid stopping twice around "return" during stepping.
        # For Step Over/Step Into, map the return event to the nearest user caller
        # frame so the UI stops at the call site (VS Code/debugpy style) with a
        # single click. For other commands, ignore return events and wait for the
        # next 'line' event.
        try:
            is_step_over = (self.stopframe is frame and self.stoplineno != -1)
            is_step_into = (self.stopframe is None and self.stoplineno != -1)
        except Exception:
            is_step_over = False
            is_step_into = False

        if is_step_over or is_step_into:
            caller = frame.f_back
            while caller is not None and not self._is_user_frame(caller):
                caller = caller.f_back
            if caller is not None:
                self._pause(caller)
            return
        return

    def user_exception(self, frame, exc_info):
        self._pause(frame)

    def _snapshot(self, frame, pause_id):
        locals_payload, locals_meta = _dbg_snapshot_vars(frame.f_locals)
        return {
            "pauseId": pause_id,
            "stack": self._build_user_stack(frame),
            "frame": {
                "filename": frame.f_code.co_filename,
                "lineno": frame.f_lineno,
                "function": frame.f_code.co_name,
            },
            "locals": locals_payload,
            "localsMeta": locals_meta,
            "limits": {
                "maxReprChars": MAX_REPR_CHARS,
                "maxLocals": MAX_LOCALS,
                "maxChildren": MAX_CHILDREN,
                "maxFullReprChars": MAX_FULL_REPR_CHARS,
            },
        }

    def _snapshot_locals_page(self, frame, pause_id, offset):
        locals_payload, locals_meta = _dbg_snapshot_vars(frame.f_locals, offset=offset, limit=MAX_LOCALS)
        return {
            "type": "debug_locals_page",
            "pauseId": pause_id,
            "offset": int(offset) if isinstance(offset, int) else 0,
            "locals": locals_payload,
            "localsMeta": locals_meta,
        }

    def _pause(self, frame):
        global _dbg_active_frame
        if not self._is_user_frame(frame):
            return

        if self._pending_step_out:
            self._pending_step_out = False
            self._step_out_frame = None

        self._pause_seq += 1
        pause_id = self._pause_seq
        self._active_pause_id = pause_id
        _dbg_active_frame = frame
        snap = self._snapshot(frame, pause_id)
        postMessage(to_js({"type": "debug_paused", "data": snap, "line": frame.f_lineno}, dict_converter=Object.fromEntries))

        self._waiting = True
        try:
            while self._waiting:
                try:
                    updated_breakpoints_update = getUpdatedBreakpointsUpdate()
                    if updated_breakpoints_update is not None:
                        file_path = str(updated_breakpoints_update[0])
                        lines = list(updated_breakpoints_update[1])
                        self.set_file_breakpoints(file_path, lines)
                except Exception:
                    pass

                cmd = getDebugCommand()
                if cmd == 1:
                    self.set_step()
                    self._waiting = False
                elif cmd == 2:
                    try:
                        self.set_next(frame)
                    except Exception:
                        self.set_step()
                    self._waiting = False
                elif cmd == 5:
                    try:
                        if frame.f_code.co_name == "<module>":
                            self.set_continue()
                            self._waiting = False
                            continue
                    except Exception:
                        pass

                    self._pending_step_out = True
                    self._step_out_frame = frame
                    try:
                        self.set_return(frame)
                    except Exception:
                        self._pending_step_out = False
                        self._step_out_frame = None
                        self.set_continue()
                    self._waiting = False
                elif cmd == 3:
                    self.set_continue()
                    self._waiting = False
                elif cmd == 4:
                    raise KeyboardInterrupt("Stopped by user")
                else:
                    try:
                        oid = getDebugInspectRequest()
                    except Exception:
                        oid = 0
                    if oid:
                        try:
                            children_offset = getDebugInspectChildrenOffset()
                        except Exception:
                            children_offset = 0
                        if not isinstance(children_offset, int) or children_offset < 0:
                            children_offset = 0
                        try:
                            children, meta = _dbg_children(oid, offset=children_offset, max_items=MAX_CHILDREN)
                            postMessage(to_js({"type": "debug_children", "pauseId": pause_id, "objectId": oid, "offset": children_offset, "children": children, "meta": meta}, dict_converter=Object.fromEntries))
                        except Exception:
                            postMessage(to_js({"type": "debug_children", "pauseId": pause_id, "objectId": oid, "offset": children_offset, "children": [], "meta": _dbg_meta(0, 0)}, dict_converter=Object.fromEntries))

                    try:
                        repr_oid = getDebugInspectReprRequest()
                    except Exception:
                        repr_oid = 0
                    if repr_oid:
                        try:
                            repr_payload = _dbg_full_repr(repr_oid, max_chars=MAX_FULL_REPR_CHARS)
                            repr_payload.update({"type": "debug_repr", "pauseId": pause_id, "objectId": repr_oid})
                            postMessage(to_js(repr_payload, dict_converter=Object.fromEntries))
                        except Exception:
                            postMessage(to_js({"type": "debug_repr", "pauseId": pause_id, "objectId": repr_oid, "repr": "<unrepr>", "truncated": False, "totalChars": 0, "sentChars": 8}, dict_converter=Object.fromEntries))

                    try:
                        locals_offset = getDebugLocalsRequest()
                    except Exception:
                        locals_offset = -1
                    if isinstance(locals_offset, int) and locals_offset >= 0:
                        try:
                            locals_payload = self._snapshot_locals_page(frame, pause_id, locals_offset)
                            postMessage(to_js(locals_payload, dict_converter=Object.fromEntries))
                        except Exception:
                            postMessage(to_js({"type": "debug_locals_page", "pauseId": pause_id, "offset": locals_offset, "locals": [], "localsMeta": _dbg_meta(0, 0)}, dict_converter=Object.fromEntries))

                    time.sleep(0.01)
        finally:
            self._active_pause_id = 0
            _dbg_active_frame = None

    def _is_user_frame(self, frame):
        try:
            filename = frame.f_code.co_filename
        except Exception:
            return False
        return _is_valid_user_filename(filename)

    def _apply_breakpoints(self):
        self.clear_all_breaks()
        for file_path, lines in self._breakpoints_by_file.items():
            for lineno in lines:
                try:
                    self.set_break(file_path, lineno)
                except Exception:
                    pass

    def set_entry_breakpoints(self, line_numbers):
        self._breakpoints_by_file[self._entry_file] = _coerce_breakpoint_lines(line_numbers)
        self._apply_breakpoints()

    def set_file_breakpoints(self, file_path, line_numbers):
        try:
            normalized_file_path = str(file_path)
        except Exception:
            return
        if not normalized_file_path.startswith(USER_PREFIX):
            return
        self._breakpoints_by_file[normalized_file_path] = _coerce_breakpoint_lines(line_numbers)
        self._apply_breakpoints()

    def set_breakpoints_by_file(self, breakpoints_by_file):
        normalized = _normalize_breakpoints_map(breakpoints_by_file)
        if self._entry_file not in normalized:
            normalized[self._entry_file] = []
        self._breakpoints_by_file = normalized
        self._apply_breakpoints()

    def run_code(self, src, breakpoints_by_file=None):
        code = compile(src, self._entry_file, "exec")

        self.set_breakpoints_by_file(breakpoints_by_file if isinstance(breakpoints_by_file, Mapping) else {})
        has_any_breakpoint = any(bool(lines) for lines in self._breakpoints_by_file.values())
        if not has_any_breakpoint:
            self.set_step()

        module = types.ModuleType("__main__")
        try:
            module.__file__ = self._entry_file
        except Exception:
            pass
        module.__dict__["__name__"] = "__main__"
        module.__dict__["__builtins__"] = __builtins__

        try:
            sys.modules["__main__"] = module
        except Exception:
            pass

        self._module_globals = module.__dict__
        self.runctx(code, module.__dict__, module.__dict__)

dbg = JsControlledDebugger(ENTRY_FILE)
`)}async function se({code:e,entryPath:t,breakpointsByFile:r}){await re(t),self.postMessage({type:"debug_setup_finished"}),await n.runPythonAsync(`
try:
    dbg.run_code(${JSON.stringify(e)}, ${JSON.stringify(r)})
except KeyboardInterrupt:
    pass
`)}async function ie(e){let t=Number.isFinite(e?.pauseId)?e.pauseId:0,r=Number.isFinite(e?.objectId)?e.objectId:0,s=Number.isFinite(e?.offset)?Math.max(0,e.offset|0):0,i=Number.isFinite(e?.maxItems)?Math.max(0,Math.min(e.maxItems|0,d.MAX_CHILDREN)):d.MAX_CHILDREN;try{let o=await n.runPythonAsync(`
from pyodide.ffi import to_js
from js import Object
children, meta = _dbg_children(${JSON.stringify(r)}, offset=${JSON.stringify(s)}, max_items=${JSON.stringify(i)})
to_js({"children": children, "meta": meta}, dict_converter=Object.fromEntries)
`),u=Array.isArray(o?.children)?Array.from(o.children):[],c=o?.meta||{total:u.length,sent:u.length,truncated:!1,omitted:0};self.postMessage({type:"debug_children",pauseId:t,objectId:r,offset:s,children:u,meta:c})}catch{self.postMessage({type:"debug_children",pauseId:t,objectId:r,offset:s,children:[],meta:{total:0,sent:0,truncated:!1,omitted:0}})}}async function ne(e){let t=Number.isFinite(e?.pauseId)?e.pauseId:0,r=Number.isFinite(e?.offset)?Math.max(0,e.offset|0):0;try{let s=await n.runPythonAsync(`
from pyodide.ffi import to_js
from js import Object
locals_payload, locals_meta = _dbg_locals_page_from_active_frame(offset=${JSON.stringify(r)}, limit=MAX_LOCALS)
to_js({"locals": locals_payload, "localsMeta": locals_meta}, dict_converter=Object.fromEntries)
`),i=Array.isArray(s?.locals)?Array.from(s.locals):[],o=s?.localsMeta||{total:i.length,sent:i.length,truncated:!1,omitted:0};self.postMessage({type:"debug_locals_page",pauseId:t,offset:r,locals:i,localsMeta:o})}catch{self.postMessage({type:"debug_locals_page",pauseId:t,offset:r,locals:[],localsMeta:{total:0,sent:0,truncated:!1,omitted:0}})}}async function oe(e){let t=Number.isFinite(e?.pauseId)?e.pauseId:0,r=Number.isFinite(e?.objectId)?e.objectId:0,s=Number.isFinite(e?.maxChars)?Math.max(1,Math.min(e.maxChars|0,d.MAX_FULL_REPR_CHARS)):d.MAX_FULL_REPR_CHARS;try{let i=await n.runPythonAsync(`
from pyodide.ffi import to_js
from js import Object
payload = _dbg_full_repr(${JSON.stringify(r)}, max_chars=${JSON.stringify(s)})
to_js(payload, dict_converter=Object.fromEntries)
`);self.postMessage({type:"debug_repr",pauseId:t,objectId:r,repr:String(i?.repr??"<unrepr>"),truncated:!!i?.truncated,totalChars:Number.isFinite(i?.totalChars)?i.totalChars:0,sentChars:Number.isFinite(i?.sentChars)?i.sentChars:String(i?.repr??"").length})}catch{self.postMessage({type:"debug_repr",pauseId:t,objectId:r,repr:"<unrepr>",truncated:!1,totalChars:0,sentChars:8})}}self.onmessage=async e=>{let{type:t,code:r,pyodideURL:s,modules:i,inputBuffer:o,inputTextBuffer:u,interruptBuffer:c,packages:b,controlBuffer:j,breakpointsBuffer:x,entryFile:m,breakpointsByFile:g}=e.data;if(t==="init"){let l={stdout:f=>self.postMessage({type:"stdout",data:{text:f}}),stderr:f=>self.postMessage({type:"stderr",error:{text:f}}),indexURL:s,fullStdLib:!0};try{importScripts(s+"pyodide.js"),R=(async()=>(n=await loadPyodide(l),A?.ensureUserDir?.(n.FS),n.FS.chdir(A?.USER_DIR||"/user"),await n.loadPackage("micropip"),await n.loadPackagesFromImports(D),await n.runPythonAsync(D),await te(o,u),c&&h(c.buffer)&&n.setInterruptBuffer(c),n._api.config.indexURL=`https://cdn.jsdelivr.net/pyodide/${W}/full/`,n))(),await R,self.postMessage({type:"ready"})}catch(f){self.postMessage({type:"error",error:{text:`Error initializing Pyodide: ${f.message}`}})}return}if(await R,t==="code")try{n.interruptBuffer&&(n.interruptBuffer[0]=0);let l=await X(r||"",Array.isArray(b)?b:[]);self.postMessage({type:"packages_managed",data:{packages:l}}),/(import\s+(matplotlib|seaborn)|from\s+(matplotlib|seaborn)\s+import)/.test(r)&&await z(),/(import\s+plotly|from\s+plotly\s+import)/.test(r)&&await U(),self.postMessage({type:"modules_loaded",data:{text:""}});let f=await n.runPythonAsync(r);self.postMessage({type:"result",data:{text:f?.toString()||""}});return}catch(l){self.postMessage({type:"error",error:{text:l.toString()||"Unknown error"}});return}if(t==="debug_start")try{n.interruptBuffer&&(n.interruptBuffer[0]=0),c&&h(c.buffer)&&n.setInterruptBuffer(c),a=h(j)?new Int32Array(j):null,p=h(x)?new Int32Array(x):null,I=0,P=!0,w=M(m)||`${y}/main.py`;let l=ee(g,w),f=await X(r||"",Array.isArray(b)?b:[]);self.postMessage({type:"packages_managed",data:{packages:f}}),/(import\s+(matplotlib|seaborn)|from\s+(matplotlib|seaborn)\s+import)/.test(r)&&await z(),/(import\s+plotly|from\s+plotly\s+import)/.test(r)&&await U(),self.postMessage({type:"modules_loaded",data:{text:""}}),await se({code:r||"",entryPath:w,breakpointsByFile:l}),self.postMessage({type:"debug_finished"});return}catch(l){self.postMessage({type:"error",error:{text:l?.toString?.()||"Unknown error"}}),self.postMessage({type:"debug_finished"});return}finally{P=!1,w=null,I=0,a=null,p=null}if(t==="debug_inspect_children"){await ie(e.data);return}if(t==="debug_inspect_locals_page"){await ne(e.data);return}if(t==="debug_inspect_repr"){await oe(e.data);return}if(t==="uploadFile"){try{A.writeUserFile(n.FS,e.data.name,e.data.content,{encoding:"binary"})}catch(l){self.postMessage({type:"error",error:{text:l.toString()}})}return}if(t==="deleteFile"){try{A.deleteUserFile(n.FS,e.data.name)}catch(l){self.postMessage({type:"error",error:{text:l.toString()}})}return}};})();
