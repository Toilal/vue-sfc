import { Context, Module, ModuleHandler, Options } from './context'
import { PathHandler } from './path'
import { defaultPathHandler } from './node/path'

export async function loadModule (path: string, options: Options): Promise<Module> {
  const context = initContext(options)
  return await loadModuleImpl(path, context)
}

function initModules (options: Options): Record<string, Module> {
  const modules: Record<string, Module> = Object.create(null)
  if (options.modules) {
    for (const optionModule in options.modules) {
      modules[optionModule] = options.modules[optionModule]
    }
  }
  return modules
}

function initBabelPlugins (options: Options): any[] {
  return []
}

function initModuleHandlers (options: Options): Record<string, ModuleHandler> {
  const handlers: Record<string, ModuleHandler> = Object.create(null)
  if (options.moduleHandlers) {
    for (const handler in options.moduleHandlers) {
      handlers[handler] = options.moduleHandlers[handler]
    }
  }
  return handlers
}

function initPathHandler (options: Options): PathHandler {
  if (!options.pathHandler) {
    return defaultPathHandler
  }
  return options.pathHandler
}

function initContext (options: Options): Context {
  const context = {
    ...options,

    modules: initModules(options),
    babelPlugins: initBabelPlugins(options),
    moduleHandlers: initModuleHandlers(options),
    pathHandler: initPathHandler(options)
  }

  return context
}

class LoadingModule {
  promise: Promise<Module>

  constructor (promise: Promise<Module>) {
    this.promise = promise
  }
}

async function loadModuleImpl (path: string, context: Context): Promise<Module> {
  const modules = context.modules

  if (path in modules) {
    const module = modules[path]
    if (module instanceof LoadingModule) {
      return await module.promise
    }

    return module
  }

  const loadingModule = new LoadingModule(
    (async () => {
      if (context.loadModule) {
        const module = await context.loadModule(path, context)
        if (module !== undefined) {
          context.modules[path] = module
          return module
        }
      }

      const res = await context.getFile(path)

      const file = typeof res === 'object' ? res : { content: res, extname: context.pathHandler.extname(path) }

      if (!(file.extname in context.moduleHandlers)) {
        throw new TypeError(`Unable to handle ${file.extname} files (${path}), see additionalModuleHandlers`)
      }

      if (typeof file.content as any !== 'string') {
        throw new TypeError(`Invalid module content (${path}): ${file.content}`)
      }

      const module = await context.moduleHandlers[file.extname](file.content, path, context)

      context.modules[path] = module
      return module
    })()
  )

  context.modules[path] = loadingModule
  return loadingModule
}
