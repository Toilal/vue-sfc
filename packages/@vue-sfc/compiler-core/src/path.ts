export interface PathHandler {
  /**
   * Get extension from filepath.
   *
   * @param filepath
   */
  extname: (filepath: string) => string

  /**
   *
   * Resolve a relative dependency path from given root path.
   *
   * @param absoluteFilepath
   * @param dependencyPath
   */
  resolve: (absoluteFilepath: string, dependencyPath: string) => string
}
