import Path from 'path'

import { PathHandler } from '../path'

/**
 * Default implementation of PathHandlers
 */
export const defaultPathHandler: PathHandler = {
  extname (filepath) {
    return Path.extname(filepath)
  },
  resolve (absoluteFilepath, dependencyPath) {
    return dependencyPath[0] !== '.' ? dependencyPath : Path.normalize(Path.join(Path.dirname(absoluteFilepath), dependencyPath))
  }
}
