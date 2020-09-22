"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const config_1 = require("./config");
const constants = require("./constants");
const instances_1 = require("./instances");
const resolver_1 = require("./resolver");
const utils_1 = require("./utils");
function readFileWithInstance(instance, filePath, encoding) {
    if (instance.solutionBuilderHost) {
        const outputFile = instance.solutionBuilderHost.getOutputFileFromReferencedProject(filePath);
        if (outputFile !== undefined) {
            return outputFile ? outputFile.text : undefined;
        }
    }
    return (instance.compiler.sys.readFile(filePath, encoding) ||
        utils_1.readFile(filePath, encoding));
}
/**
 * Create the TypeScript language service
 */
function makeServicesHost(scriptRegex, loader, instance, enableFileCaching, projectReferences) {
    const { compiler, compilerOptions, appendTsTsxSuffixesIfRequired, files, loaderOptions: { resolveModuleName: customResolveModuleName, resolveTypeReferenceDirective: customResolveTypeReferenceDirective } } = instance;
    const newLine = compilerOptions.newLine === constants.CarriageReturnLineFeedCode
        ? constants.CarriageReturnLineFeed
        : compilerOptions.newLine === constants.LineFeedCode
            ? constants.LineFeed
            : constants.EOL;
    // make a (sync) resolver that follows webpack's rules
    const resolveSync = resolver_1.makeResolver(loader._compiler.options);
    const readFileWithFallback = (filePath, encoding) => readFileWithInstance(instance, filePath, encoding);
    const fileExists = (filePathToCheck) => {
        if (instance.solutionBuilderHost) {
            const outputFile = instance.solutionBuilderHost.getOutputFileFromReferencedProject(filePathToCheck);
            if (outputFile !== undefined) {
                return !!outputFile;
            }
        }
        return (compiler.sys.fileExists(filePathToCheck) ||
            utils_1.readFile(filePathToCheck) !== undefined);
    };
    let clearCache = null;
    let moduleResolutionHost = {
        fileExists,
        readFile: readFileWithFallback,
        realpath: compiler.sys.realpath,
        directoryExists: compiler.sys.directoryExists,
        getCurrentDirectory: compiler.sys.getCurrentDirectory,
        getDirectories: compiler.sys.getDirectories
    };
    if (enableFileCaching) {
        const cached = addCache(moduleResolutionHost);
        clearCache = cached.clearCache;
        moduleResolutionHost = cached.moduleResolutionHost;
    }
    // loader.context seems to work fine on Linux / Mac regardless causes problems for @types resolution on Windows for TypeScript < 2.3
    const getCurrentDirectory = () => loader.context;
    const resolvers = makeResolvers(compiler, compilerOptions, moduleResolutionHost, customResolveTypeReferenceDirective, customResolveModuleName, resolveSync, appendTsTsxSuffixesIfRequired, scriptRegex, instance);
    const servicesHost = {
        getProjectVersion: () => `${instance.version}`,
        getProjectReferences: () => projectReferences,
        getScriptFileNames: () => [...files.keys()].filter(filePath => filePath.match(scriptRegex)),
        getScriptVersion: (fileName) => {
            fileName = path.normalize(fileName);
            const file = files.get(fileName);
            if (file) {
                return file.version.toString();
            }
            const outputFile = instance.solutionBuilderHost &&
                instance.solutionBuilderHost.getOutputFileFromReferencedProject(fileName);
            if (outputFile !== undefined) {
                instance.solutionBuilderHost.outputAffectingInstanceVersion.set(path.resolve(fileName), true);
            }
            return outputFile ? outputFile.version.toString() : '';
        },
        getScriptSnapshot: (fileName) => {
            // This is called any time TypeScript needs a file's text
            // We either load from memory or from disk
            fileName = path.normalize(fileName);
            let file = files.get(fileName);
            if (file === undefined) {
                if (instance.solutionBuilderHost) {
                    const outputFile = instance.solutionBuilderHost.getOutputFileFromReferencedProject(fileName);
                    if (outputFile !== undefined) {
                        instance.solutionBuilderHost.outputAffectingInstanceVersion.set(path.resolve(fileName), true);
                        return outputFile
                            ? compiler.ScriptSnapshot.fromString(outputFile.text)
                            : undefined;
                    }
                }
                const text = utils_1.readFile(fileName);
                if (text === undefined) {
                    return undefined;
                }
                file = { version: 0, text };
                files.set(fileName, file);
            }
            return compiler.ScriptSnapshot.fromString(file.text);
        },
        /**
         * getDirectories is also required for full import and type reference completions.
         * Without it defined, certain completions will not be provided
         */
        getDirectories: compiler.sys.getDirectories,
        /**
         * For @types expansion, these two functions are needed.
         */
        directoryExists: moduleResolutionHost.directoryExists,
        useCaseSensitiveFileNames: () => compiler.sys.useCaseSensitiveFileNames,
        realpath: moduleResolutionHost.realpath,
        // The following three methods are necessary for @types resolution from TS 2.4.1 onwards see: https://github.com/Microsoft/TypeScript/issues/16772
        fileExists: moduleResolutionHost.fileExists,
        readFile: moduleResolutionHost.readFile,
        readDirectory: compiler.sys.readDirectory,
        getCurrentDirectory,
        getCompilationSettings: () => compilerOptions,
        getDefaultLibFileName: (options) => compiler.getDefaultLibFilePath(options),
        getNewLine: () => newLine,
        trace: instance.log.log,
        log: instance.log.log,
        // used for (/// <reference types="...">) see https://github.com/Realytics/fork-ts-checker-webpack-plugin/pull/250#issuecomment-485061329
        resolveTypeReferenceDirectives: resolvers.resolveTypeReferenceDirectives,
        resolveModuleNames: resolvers.resolveModuleNames,
        getCustomTransformers: () => instance.transformers
    };
    return { servicesHost, clearCache };
}
exports.makeServicesHost = makeServicesHost;
function makeResolvers(compiler, compilerOptions, moduleResolutionHost, customResolveTypeReferenceDirective, customResolveModuleName, resolveSync, appendTsTsxSuffixesIfRequired, scriptRegex, instance) {
    const resolveTypeReferenceDirective = makeResolveTypeReferenceDirective(compiler, compilerOptions, moduleResolutionHost, customResolveTypeReferenceDirective);
    const resolveTypeReferenceDirectives = (typeDirectiveNames, containingFile, _redirectedReference) => typeDirectiveNames.map(directive => resolveTypeReferenceDirective(directive, containingFile, _redirectedReference).resolvedTypeReferenceDirective);
    const resolveModuleName = makeResolveModuleName(compiler, compilerOptions, moduleResolutionHost, customResolveModuleName);
    const resolveModuleNames = (moduleNames, containingFile, _reusedNames, _redirectedReference) => {
        const resolvedModules = moduleNames.map(moduleName => resolveModule(resolveSync, resolveModuleName, appendTsTsxSuffixesIfRequired, scriptRegex, moduleName, containingFile));
        populateDependencyGraphs(resolvedModules, instance, containingFile);
        return resolvedModules;
    };
    return {
        resolveTypeReferenceDirectives,
        resolveModuleNames
    };
}
function createWatchFactory() {
    const watchedFiles = new Map();
    const watchedDirectories = new Map();
    const watchedDirectoriesRecursive = new Map();
    return {
        watchedFiles,
        watchedDirectories,
        watchedDirectoriesRecursive,
        invokeFileWatcher,
        invokeDirectoryWatcher,
        watchFile,
        watchDirectory
    };
    function invokeWatcherCallbacks(map, key, fileName, eventKind) {
        const callbacks = map.get(key);
        if (callbacks !== undefined && callbacks.length) {
            // The array copy is made to ensure that even if one of the callback removes the callbacks,
            // we dont miss any callbacks following it
            const cbs = callbacks.slice();
            for (const cb of cbs) {
                cb(fileName, eventKind);
            }
        }
    }
    function invokeFileWatcher(fileName, eventKind) {
        fileName = path.normalize(fileName);
        invokeWatcherCallbacks(watchedFiles, fileName, fileName, eventKind);
    }
    function invokeDirectoryWatcher(directory, fileAddedOrRemoved) {
        directory = path.normalize(directory);
        invokeWatcherCallbacks(watchedDirectories, directory, fileAddedOrRemoved);
        invokeRecursiveDirectoryWatcher(directory, fileAddedOrRemoved);
    }
    function invokeRecursiveDirectoryWatcher(directory, fileAddedOrRemoved) {
        directory = path.normalize(directory);
        invokeWatcherCallbacks(watchedDirectoriesRecursive, directory, fileAddedOrRemoved);
        const basePath = path.dirname(directory);
        if (directory !== basePath) {
            invokeRecursiveDirectoryWatcher(basePath, fileAddedOrRemoved);
        }
    }
    function createWatcher(file, callbacks, callback) {
        file = path.normalize(file);
        const existing = callbacks.get(file);
        if (existing === undefined) {
            callbacks.set(file, [callback]);
        }
        else {
            existing.push(callback);
        }
        return {
            close: () => {
                // tslint:disable-next-line:no-shadowed-variable
                const existing = callbacks.get(file);
                if (existing !== undefined) {
                    utils_1.unorderedRemoveItem(existing, callback);
                    if (!existing.length) {
                        callbacks.delete(file);
                    }
                }
            }
        };
    }
    function watchFile(fileName, callback, _pollingInterval) {
        return createWatcher(fileName, watchedFiles, callback);
    }
    function watchDirectory(fileName, callback, recursive) {
        return createWatcher(fileName, recursive === true ? watchedDirectoriesRecursive : watchedDirectories, callback);
    }
}
function updateFileWithText(instance, filePath, text) {
    const nFilePath = path.normalize(filePath);
    const file = instance.files.get(nFilePath) || instance.otherFiles.get(nFilePath);
    if (file !== undefined) {
        const newText = text(nFilePath);
        if (newText !== file.text) {
            file.text = newText;
            file.version++;
            file.modifiedTime = new Date();
            instance.version++;
            if (!instance.modifiedFiles) {
                instance.modifiedFiles = new Map();
            }
            instance.modifiedFiles.set(nFilePath, file);
            if (instance.watchHost !== undefined) {
                instance.watchHost.invokeFileWatcher(nFilePath, instance.compiler.FileWatcherEventKind.Changed);
            }
            if (instance.solutionBuilderHost !== undefined) {
                instance.solutionBuilderHost.invokeFileWatcher(nFilePath, instance.compiler.FileWatcherEventKind.Changed);
            }
        }
    }
}
exports.updateFileWithText = updateFileWithText;
/**
 * Create the TypeScript Watch host
 */
function makeWatchHost(scriptRegex, loader, instance, projectReferences) {
    const { compiler, compilerOptions, appendTsTsxSuffixesIfRequired, files, otherFiles, loaderOptions: { resolveModuleName: customResolveModuleName, resolveTypeReferenceDirective: customResolveTypeReferenceDirective } } = instance;
    const newLine = compilerOptions.newLine === constants.CarriageReturnLineFeedCode
        ? constants.CarriageReturnLineFeed
        : compilerOptions.newLine === constants.LineFeedCode
            ? constants.LineFeed
            : constants.EOL;
    // make a (sync) resolver that follows webpack's rules
    const resolveSync = resolver_1.makeResolver(loader._compiler.options);
    const readFileWithFallback = (filePath, encoding) => readFileWithInstance(instance, filePath, encoding);
    const moduleResolutionHost = {
        fileExists,
        readFile: readFileWithFallback,
        realpath: compiler.sys.realpath
    };
    // loader.context seems to work fine on Linux / Mac regardless causes problems for @types resolution on Windows for TypeScript < 2.3
    const getCurrentDirectory = () => loader.context;
    const { watchFile, watchDirectory, invokeFileWatcher, invokeDirectoryWatcher } = createWatchFactory();
    const resolvers = makeResolvers(compiler, compilerOptions, moduleResolutionHost, customResolveTypeReferenceDirective, customResolveModuleName, resolveSync, appendTsTsxSuffixesIfRequired, scriptRegex, instance);
    const watchHost = {
        rootFiles: getRootFileNames(),
        options: compilerOptions,
        useCaseSensitiveFileNames: () => compiler.sys.useCaseSensitiveFileNames,
        getNewLine: () => newLine,
        getCurrentDirectory,
        getDefaultLibFileName: options => compiler.getDefaultLibFilePath(options),
        fileExists,
        readFile: readFileWithCachingText,
        directoryExists: dirPath => compiler.sys.directoryExists(path.normalize(dirPath)),
        getDirectories: dirPath => compiler.sys.getDirectories(path.normalize(dirPath)),
        readDirectory: (dirPath, extensions, exclude, include, depth) => compiler.sys.readDirectory(path.normalize(dirPath), extensions, exclude, include, depth),
        realpath: dirPath => compiler.sys.resolvePath(path.normalize(dirPath)),
        trace: logData => instance.log.log(logData),
        watchFile,
        watchDirectory,
        // used for (/// <reference types="...">) see https://github.com/Realytics/fork-ts-checker-webpack-plugin/pull/250#issuecomment-485061329
        resolveTypeReferenceDirectives: resolvers.resolveTypeReferenceDirectives,
        resolveModuleNames: resolvers.resolveModuleNames,
        invokeFileWatcher,
        invokeDirectoryWatcher,
        updateRootFileNames: () => {
            instance.changedFilesList = false;
            if (instance.watchOfFilesAndCompilerOptions !== undefined) {
                instance.watchOfFilesAndCompilerOptions.updateRootFileNames(getRootFileNames());
            }
        },
        createProgram: projectReferences === undefined
            ? compiler.createEmitAndSemanticDiagnosticsBuilderProgram
            : createBuilderProgramWithReferences,
        outputFiles: new Map()
    };
    return watchHost;
    function getRootFileNames() {
        return [...files.keys()].filter(filePath => filePath.match(scriptRegex));
    }
    function readFileWithCachingText(fileName, encoding) {
        fileName = path.normalize(fileName);
        const file = files.get(fileName) || otherFiles.get(fileName);
        if (file !== undefined) {
            return file.text;
        }
        const text = readFileWithFallback(fileName, encoding);
        if (text === undefined) {
            return undefined;
        }
        otherFiles.set(fileName, { version: 0, text });
        return text;
    }
    function fileExists(fileName) {
        const filePath = path.normalize(fileName);
        return files.has(filePath) || compiler.sys.fileExists(filePath);
    }
    function createBuilderProgramWithReferences(rootNames, options, host, oldProgram, configFileParsingDiagnostics) {
        const program = compiler.createProgram({
            rootNames: rootNames,
            options: options,
            host,
            oldProgram: oldProgram && oldProgram.getProgram(),
            configFileParsingDiagnostics,
            projectReferences
        });
        const builderProgramHost = host;
        return compiler.createEmitAndSemanticDiagnosticsBuilderProgram(program, builderProgramHost, oldProgram, configFileParsingDiagnostics);
    }
}
exports.makeWatchHost = makeWatchHost;
function normalizeSlashes(file) {
    return file.replace(/\\/g, '/');
}
/**
 * Create the TypeScript Watch host
 */
function makeSolutionBuilderHost(scriptRegex, loader, instance) {
    const { compiler, compilerOptions, appendTsTsxSuffixesIfRequired, loaderOptions: { resolveModuleName: customResolveModuleName, resolveTypeReferenceDirective: customResolveTypeReferenceDirective, transpileOnly } } = instance;
    // loader.context seems to work fine on Linux / Mac regardless causes problems for @types resolution on Windows for TypeScript < 2.3
    const getCurrentDirectory = () => loader.context;
    const formatDiagnosticHost = {
        getCurrentDirectory: compiler.sys.getCurrentDirectory,
        getCanonicalFileName: compiler.sys.useCaseSensitiveFileNames
            ? s => s
            : s => s.toLowerCase(),
        getNewLine: () => compiler.sys.newLine
    };
    const diagnostics = {
        global: [],
        perFile: new Map(),
        transpileErrors: []
    };
    const reportDiagnostic = (d) => {
        if (transpileOnly) {
            const filePath = d.file ? path.resolve(d.file.fileName) : undefined;
            const last = diagnostics.transpileErrors[diagnostics.transpileErrors.length - 1];
            if (diagnostics.transpileErrors.length && last[0] === filePath) {
                last[1].push(d);
            }
            else {
                diagnostics.transpileErrors.push([filePath, [d]]);
            }
        }
        else if (d.file) {
            const filePath = path.resolve(d.file.fileName);
            const existing = diagnostics.perFile.get(filePath);
            if (existing) {
                existing.push(d);
            }
            else {
                diagnostics.perFile.set(filePath, [d]);
            }
        }
        else {
            diagnostics.global.push(d);
        }
        instance.log.logInfo(compiler.formatDiagnostic(d, formatDiagnosticHost));
    };
    const reportSolutionBuilderStatus = (d) => instance.log.logInfo(compiler.formatDiagnostic(d, formatDiagnosticHost));
    const reportWatchStatus = (d, newLine, _options) => instance.log.logInfo(`${compiler.flattenDiagnosticMessageText(d.messageText, compiler.sys.newLine)}${newLine + newLine}`);
    const outputFiles = new Map();
    const writtenFiles = [];
    const outputAffectingInstanceVersion = new Map();
    let timeoutId;
    const configFileInfo = new Map();
    const solutionBuilderHost = Object.assign(Object.assign(Object.assign(Object.assign({}, compiler.createSolutionBuilderWithWatchHost(compiler.sys, compiler.createEmitAndSemanticDiagnosticsBuilderProgram, reportDiagnostic, reportSolutionBuilderStatus, reportWatchStatus)), { diagnostics }), createWatchFactory()), { 
        // Overrides
        getCurrentDirectory, 
        // behave as if there is no tsbuild info on disk since we want to generate all outputs in memory and only use those
        readFile: (fileName, encoding) => {
            const outputFile = ensureOutputFile(fileName);
            return outputFile !== undefined
                ? outputFile
                    ? outputFile.text
                    : undefined
                : readInputFile(fileName, encoding).text;
        }, writeFile: (name, text, writeByteOrderMark) => {
            updateFileWithText(instance, name, () => text);
            const resolvedFileName = path.resolve(name);
            const existing = outputFiles.get(resolvedFileName);
            const newOutputFile = {
                name,
                text,
                writeByteOrderMark: !!writeByteOrderMark,
                time: new Date(),
                version: existing
                    ? existing.text !== text
                        ? existing.version + 1
                        : existing.version
                    : 0
            };
            outputFiles.set(resolvedFileName, newOutputFile);
            writtenFiles.push(newOutputFile);
            if (outputAffectingInstanceVersion.has(resolvedFileName) &&
                (!existing || existing.text !== text)) {
                instance.version++;
            }
        }, getModifiedTime: fileName => {
            const outputFile = ensureOutputFile(fileName);
            if (outputFile !== undefined) {
                return outputFile ? outputFile.time : undefined;
            }
            const existing = instance.files.get(path.resolve(fileName)) ||
                instance.otherFiles.get(path.resolve(fileName));
            return existing
                ? existing.modifiedTime
                : compiler.sys.getModifiedTime(fileName);
        }, setModifiedTime: (fileName, time) => {
            const outputFile = ensureOutputFile(fileName);
            if (outputFile !== undefined) {
                if (outputFile) {
                    outputFile.time = time;
                }
            }
            compiler.sys.setModifiedTime(fileName, time);
            const existing = instance.files.get(path.resolve(fileName)) ||
                instance.otherFiles.get(path.resolve(fileName));
            if (existing) {
                existing.modifiedTime = time;
            }
        }, fileExists: fileName => {
            const outputFile = ensureOutputFile(fileName);
            if (outputFile !== undefined) {
                return !!outputFile;
            }
            const existing = instance.files.get(path.resolve(fileName)) ||
                instance.otherFiles.get(path.resolve(fileName));
            return existing
                ? existing.text !== undefined
                : compiler.sys.fileExists(fileName);
        }, directoryExists: directory => {
            if (compiler.sys.directoryExists(directory)) {
                return true;
            }
            const resolvedDirectory = normalizeSlashes(path.resolve(directory)) + '/';
            for (const outputFile of outputFiles.keys()) {
                if (normalizeSlashes(outputFile).startsWith(resolvedDirectory)) {
                    return true;
                }
            }
            return false;
        }, afterProgramEmitAndDiagnostics: transpileOnly ? undefined : storeDtsFiles, setTimeout: (callback, _time, ...args) => {
            timeoutId = [callback, args];
            return timeoutId;
        }, clearTimeout: _timeoutId => {
            timeoutId = undefined;
        }, writtenFiles,
        configFileInfo,
        outputAffectingInstanceVersion,
        getOutputFileFromReferencedProject, getInputFileNameFromOutput: fileName => {
            const result = getInputFileNameFromOutput(fileName);
            return typeof result === 'string' ? result : undefined;
        }, getOutputFilesFromReferencedProjectInput,
        buildReferences });
    solutionBuilderHost.trace = logData => instance.log.logInfo(logData);
    solutionBuilderHost.getParsedCommandLine = file => {
        const config = config_1.getParsedCommandLine(compiler, instance.loaderOptions, file);
        configFileInfo.set(path.resolve(file), { config });
        return config;
    };
    // make a (sync) resolver that follows webpack's rules
    const resolveSync = resolver_1.makeResolver(loader._compiler.options);
    const resolvers = makeResolvers(compiler, compilerOptions, solutionBuilderHost, customResolveTypeReferenceDirective, customResolveModuleName, resolveSync, appendTsTsxSuffixesIfRequired, scriptRegex, instance);
    // used for (/// <reference types="...">) see https://github.com/Realytics/fork-ts-checker-webpack-plugin/pull/250#issuecomment-485061329
    solutionBuilderHost.resolveTypeReferenceDirectives =
        resolvers.resolveTypeReferenceDirectives;
    solutionBuilderHost.resolveModuleNames = resolvers.resolveModuleNames;
    return solutionBuilderHost;
    function buildReferences() {
        if (!timeoutId) {
            return;
        }
        diagnostics.global.length = 0;
        diagnostics.perFile.clear();
        diagnostics.transpileErrors.length = 0;
        while (timeoutId) {
            const [callback, args] = timeoutId;
            timeoutId = undefined;
            callback(...args);
        }
    }
    function storeDtsFiles(builderProgram) {
        const program = builderProgram.getProgram();
        for (const configInfo of configFileInfo.values()) {
            if (!configInfo.config ||
                program.getRootFileNames() !== configInfo.config.fileNames ||
                program.getCompilerOptions() !== configInfo.config.options ||
                program.getProjectReferences() !== configInfo.config.projectReferences) {
                continue;
            }
            configInfo.dtsFiles = program
                .getSourceFiles()
                .map(file => path.resolve(file.fileName))
                .filter(fileName => fileName.match(constants.dtsDtsxOrDtsDtsxMapRegex));
            return;
        }
    }
    function getInputFileNameFromOutput(outputFileName) {
        const resolvedFileName = path.resolve(outputFileName);
        for (const configInfo of configFileInfo.values()) {
            ensureInputOutputInfo(configInfo);
            if (configInfo.outputFileNames) {
                for (const [inputFileName, outputFilesOfInput] of configInfo.outputFileNames.entries()) {
                    if (outputFilesOfInput.indexOf(resolvedFileName) !== -1) {
                        return inputFileName;
                    }
                }
            }
            if (configInfo.tsbuildInfoFile &&
                path.resolve(configInfo.tsbuildInfoFile) === resolvedFileName) {
                return true;
            }
        }
        return undefined;
    }
    function ensureInputOutputInfo(configInfo) {
        if (configInfo.outputFileNames || !configInfo.config) {
            return;
        }
        configInfo.outputFileNames = new Map();
        configInfo.config.fileNames.forEach(inputFile => configInfo.outputFileNames.set(path.resolve(inputFile), instances_1.getOutputFileNames(instance, configInfo.config, inputFile).map(output => path.resolve(output))));
        configInfo.tsbuildInfoFile = instance.compiler
            .getTsBuildInfoEmitOutputFilePath
            ? instance.compiler.getTsBuildInfoEmitOutputFilePath(configInfo.config.options)
            : // before api
                instance.compiler.getOutputPathForBuildInfo(configInfo.config.options);
    }
    function getOutputFileFromReferencedProject(outputFileName) {
        const resolvedFileName = path.resolve(outputFileName);
        return outputFiles.get(resolvedFileName);
    }
    function ensureOutputFile(outputFileName, encoding) {
        const outputFile = getOutputFileFromReferencedProject(outputFileName);
        if (outputFile !== undefined) {
            return outputFile;
        }
        if (!getInputFileNameFromOutput(outputFileName)) {
            return undefined;
        }
        const resolvedFileName = path.resolve(outputFileName);
        const text = compiler.sys.readFile(outputFileName, encoding);
        if (text === undefined) {
            outputFiles.set(resolvedFileName, false);
            return false;
        }
        const newOutputFile = {
            name: outputFileName,
            text,
            writeByteOrderMark: false,
            time: compiler.sys.getModifiedTime(outputFileName),
            version: 0
        };
        outputFiles.set(resolvedFileName, newOutputFile);
        return newOutputFile;
    }
    function getOutputFilesFromReferencedProjectInput(inputFileName) {
        const resolvedFileName = path.resolve(inputFileName);
        for (const configInfo of configFileInfo.values()) {
            ensureInputOutputInfo(configInfo);
            if (configInfo.outputFileNames) {
                const result = configInfo.outputFileNames.get(resolvedFileName);
                if (result) {
                    return result
                        .map(outputFile => outputFiles.get(outputFile))
                        .filter(output => !!output);
                }
            }
        }
        return [];
    }
    function readInputFile(inputFileName, encoding) {
        const resolvedFileName = path.resolve(inputFileName);
        const existing = instance.otherFiles.get(resolvedFileName);
        if (existing) {
            return existing;
        }
        const tsFile = {
            version: 1,
            text: compiler.sys.readFile(inputFileName, encoding),
            modifiedTime: compiler.sys.getModifiedTime(inputFileName)
        };
        instance.otherFiles.set(resolvedFileName, tsFile);
        return tsFile;
    }
}
exports.makeSolutionBuilderHost = makeSolutionBuilderHost;
function getSolutionErrors(instance, context) {
    const solutionErrors = [];
    if (instance.solutionBuilderHost &&
        instance.solutionBuilderHost.diagnostics.transpileErrors.length) {
        instance.solutionBuilderHost.diagnostics.transpileErrors.forEach(([filePath, errors]) => solutionErrors.push(...utils_1.formatErrors(errors, instance.loaderOptions, instance.colors, instance.compiler, { file: filePath ? undefined : 'tsconfig.json' }, context)));
    }
    return solutionErrors;
}
exports.getSolutionErrors = getSolutionErrors;
function makeResolveTypeReferenceDirective(compiler, compilerOptions, moduleResolutionHost, customResolveTypeReferenceDirective) {
    if (customResolveTypeReferenceDirective === undefined) {
        return (directive, containingFile, redirectedReference) => compiler.resolveTypeReferenceDirective(directive, containingFile, compilerOptions, moduleResolutionHost, redirectedReference);
    }
    return (directive, containingFile) => customResolveTypeReferenceDirective(directive, containingFile, compilerOptions, moduleResolutionHost, compiler.resolveTypeReferenceDirective);
}
function isJsImplementationOfTypings(resolvedModule, tsResolution) {
    return (resolvedModule.resolvedFileName.endsWith('js') &&
        /\.d\.ts$/.test(tsResolution.resolvedFileName));
}
function resolveModule(resolveSync, resolveModuleName, appendTsTsxSuffixesIfRequired, scriptRegex, moduleName, containingFile) {
    let resolutionResult;
    try {
        const originalFileName = resolveSync(undefined, path.normalize(path.dirname(containingFile)), moduleName);
        const resolvedFileName = appendTsTsxSuffixesIfRequired(originalFileName);
        if (resolvedFileName.match(scriptRegex) !== null) {
            resolutionResult = { resolvedFileName, originalFileName };
        }
        // tslint:disable-next-line:no-empty
    }
    catch (e) { }
    const tsResolution = resolveModuleName(moduleName, containingFile);
    if (tsResolution.resolvedModule !== undefined) {
        const resolvedFileName = path.normalize(tsResolution.resolvedModule.resolvedFileName);
        const tsResolutionResult = {
            originalFileName: resolvedFileName,
            resolvedFileName,
            isExternalLibraryImport: tsResolution.resolvedModule.isExternalLibraryImport
        };
        return resolutionResult === undefined ||
            resolutionResult.resolvedFileName ===
                tsResolutionResult.resolvedFileName ||
            isJsImplementationOfTypings(resolutionResult, tsResolutionResult)
            ? tsResolutionResult
            : resolutionResult;
    }
    return resolutionResult;
}
function makeResolveModuleName(compiler, compilerOptions, moduleResolutionHost, customResolveModuleName) {
    if (customResolveModuleName === undefined) {
        return (moduleName, containingFile) => compiler.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
    }
    return (moduleName, containingFile) => customResolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost, compiler.resolveModuleName);
}
function populateDependencyGraphs(resolvedModules, instance, containingFile) {
    resolvedModules = resolvedModules.filter(mod => mod !== null && mod !== undefined);
    instance.dependencyGraph[path.normalize(containingFile)] = resolvedModules;
    resolvedModules.forEach(resolvedModule => {
        if (instance.reverseDependencyGraph[resolvedModule.resolvedFileName] ===
            undefined) {
            instance.reverseDependencyGraph[resolvedModule.resolvedFileName] = {};
        }
        instance.reverseDependencyGraph[resolvedModule.resolvedFileName][path.normalize(containingFile)] = true;
    });
}
function addCache(servicesHost) {
    const clearCacheFunctions = [];
    return {
        moduleResolutionHost: Object.assign(Object.assign({}, servicesHost), { fileExists: createCache(servicesHost.fileExists), directoryExists: servicesHost.directoryExists &&
                createCache(servicesHost.directoryExists), realpath: servicesHost.realpath && createCache(servicesHost.realpath) }),
        clearCache: () => clearCacheFunctions.forEach(clear => clear())
    };
    function createCache(originalFunction) {
        const cache = new Map();
        clearCacheFunctions.push(() => cache.clear());
        return function getCached(arg) {
            let res = cache.get(arg);
            if (res !== undefined) {
                return res;
            }
            res = originalFunction(arg);
            cache.set(arg, res);
            return res;
        };
    }
}
//# sourceMappingURL=servicesHost.js.map