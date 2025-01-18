import path from 'path';
import { checkPath, readFile, generateUUID ,saveFile,copyFileSync, copyFolder} from "./utils.js"
import { loadAndExecuteMod } from './load.js';

import { 
    AddonManifestHeader, 
    AddonManifestModule, 
    AddonManifest, 
    AddonManifestMetadata
} from '../core/addon/manifest.js';

import { generateItemTextureJson, generateBlockTextureJson } from './tools/textureSet.js';



const pathConfig = {
    mojangPath: `C:/Users/${process.env.USERNAME}/AppData/Local/Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/`,
    mojangBetaPath:`C:/Users/${process.env.USERNAME}/AppData/Local/Packages/Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe/LocalState/games/com.mojang`,
    projectsPath: './projects'
};

export const buildProject = (projectPath,projectName) => {
   console.log("开始构建项目");
   console.log("项目路径：" + projectPath);
    //检查项目是否存在
    if(checkPath(projectPath)) {
        console.log("项目不存在");
        return;
    }
    //检查项目是否有build.config文件
    if(checkPath(path.join(projectPath,"build.config"))) {
        console.log("项目没有build.config文件");
        return;
    }

    //读取build.config文件
    const buildConfigPath = path.join(projectPath,"build.config");
    const buildConfig = JSON.parse(readFile(buildConfigPath));
    //console.log(buildConfig);

    //读取mod.info文件
    const modInfoPath = path.join(projectPath,"mod.info");
    const modInfo = JSON.parse(readFile(modInfoPath));
    const min_engine_version = versionStringToArray(modInfo.min_engine_version);

    const behManifest = generateBehManifest(
        modInfo.name,
        modInfo.description,
        modInfo.version,
        {
            min_engine_version:min_engine_version,
        },
        buildConfig.defaultConfig.dependencies,
        buildConfig.defaultConfig.scriptEntry
    );

    const resManifest = generateResManifest(
        modInfo.name,
        modInfo.description,
        modInfo.version,
        {
            min_engine_version:min_engine_version,
        },
        []
    );

    const buildDirPath = path.join(projectPath,buildConfig.defaultConfig.buildDir);

    const buildBehDirPath = path.join(buildDirPath,"behavior_packs/");
    const buildResDirPath = path.join(buildDirPath,"resource_packs/");
    //生成manifest.json文件
    //判断manifest.json是否已经生成过了，生成过了就不用生成
    const manifestPath = path.join(buildBehDirPath,"manifest.json");
    if(checkPath(manifestPath)){
       //BP
        saveFile(path.join(buildBehDirPath,"manifest.json"),behManifest);
        //RP
        saveFile(path.join(buildResDirPath,"manifest.json"),resManifest); 
    }

    //复制pack_icon.png
    const packIconPath = path.join(projectPath,"pack_icon.png");
    
    copyFileSync(packIconPath,path.join(buildBehDirPath,"pack_icon.png"));
    copyFileSync(packIconPath,path.join(buildResDirPath,"pack_icon.png"));

    //复制文件夹
    const resources = buildConfig.resources;
    resources.forEach(element => {
        const sourcePath = path.join(projectPath,element.path);
        copyFolder(sourcePath,buildResDirPath);
    });

    //复制scripts文件夹
    const scripts = buildConfig.scripts;
    const scriptPath = path.join(buildBehDirPath,"scripts/");
    scripts.forEach(element => {
        const sourcePath = path.join(projectPath,element.path);
        copyFolder(sourcePath,scriptPath);
    });

    //生成item_texture.json
    const item_texture_dir = path.join(buildResDirPath,"textures/items");
    const item_texture_json_path = path.join(buildResDirPath,"textures/item_texture.json")
    generateItemTextureJson(item_texture_dir,item_texture_json_path,projectName);

    //生成terrain_texture.json
    const terrain_texture_dir = path.join(buildResDirPath,"textures/blocks")
    const terrain_texture_json_path = path.join(buildResDirPath,"textures/terrain_texture.json")
    generateBlockTextureJson(terrain_texture_dir,terrain_texture_json_path,projectName);

    //动态加载用户modjs文件
    loadAndExecuteMod(path.join(projectPath,buildConfig.defaultConfig.buildEntry),buildDirPath);

    
    
    setTimeout(()=>{
        //将编译好的文件夹拷贝至mc
        //console.log(path.join(pathConfig.mojangPath,`development_behavior_packs/${projectName}_BP/`));
        copyFolder(buildBehDirPath,path.join(pathConfig.mojangPath,`development_behavior_packs/${projectName}_BP/`));
        copyFolder(buildResDirPath,path.join(pathConfig.mojangPath,`development_resource_packs/${projectName}_RP/`));
    },1000);

}

function versionStringToArray(versionString) {
  // 使用 split 方法将字符串按 '.' 分割成数组
  const parts = versionString.split('.');

  // 使用 map 方法将每个部分转换为数字
  const versionArray = parts.map(part => Number(part));

  return versionArray;
}

const generateBehManifest = (name, description, version, options = {},dependencies = [],entry) => {
    console.log("开始生成behavior_packs/manifest.json")
    console.log("Entry:",entry)
    const header = new AddonManifestHeader(
        (name+"_BP"),
        description,
        versionStringToArray(version),
        generateUUID(),
        options
    );
    const module = new AddonManifestModule(
        "行为模块",
        "data",
        generateUUID(),
        versionStringToArray(version)
    );
    const script_module = new AddonManifestModule(
        "脚本模块",
        "script",
        generateUUID(),
        versionStringToArray(version)
    );
    if(entry){script_module.entry = entry;}

    const metadata = new AddonManifestMetadata(
        ["@sapdon"],
        "MIT",
        {
            "sapdon":["1.0.0"]
        },
        "addon",
        "https://github.com/junjun260/sapdon"
    );
    
    const manifest = new AddonManifest(
        2,//格式版本
        header,
        [module,script_module],
        dependencies,
        null,
        metadata
    );

    return JSON.stringify(manifest, null, 2);
}

const generateResManifest = (name, description, version,options = {},dependencies = []) => {
    const header = new AddonManifestHeader(
        (name+"_RP"),
        description,
        versionStringToArray(version),
        generateUUID(),
        options
    );
    const module = new AddonManifestModule(
        "资源模块",
        "resources",
        generateUUID(),
        versionStringToArray(version)
    );

    const metadata = new AddonManifestMetadata(
        ["@sapdon"],
        "MIT",
        {
            "sapdon":["1.0.0"]
        },
        "addon",
        "https://github.com/junjun260/sapdon"
    );

    const manifest = new AddonManifest(
        2,//格式版本
        header,
        [module],
        [],
        null,
        metadata
    );

    return JSON.stringify(manifest, null, 2);
}