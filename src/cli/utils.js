import fs from 'fs';
import path from 'path';
import downlaod from 'download';
import { randomUUID } from 'crypto';

export const generateUUID = () => {
  return randomUUID();
};


/**
 * 同步复制文件
 * @param {string} src 源文件路径
 * @param {string} dest 目标文件路径
 */
export function copyFileSync(src, dest) {
    try {
        fs.copyFileSync(src, dest);
    } catch (err) {
        console.error('文件复制失败：', err);
    }
}

//检查路径
export const checkPath = (filePath) => {
    if(!fs.existsSync(filePath)){
        return true;
    }
    else{
        return false;
    }
}

//读取文件
export const readFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

/**
 * 保存文件
 * @param {string} filePath 绝对路径
 * @param {string} data 数据
 */
export const saveFile = (filePath,data) =>{
    // 确保目录存在
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
      
    // 创建文件并写入内容
    fs.writeFile(filePath,data, (err) => {
      if (err) {
        return console.error(err);
      }
    });
}

export const copyFolder= (sourcePath, destinationPath) => {
    // 确保目录存在
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    // 检查源路径是否存在
    if (!fs.existsSync(sourcePath)) {
      console.log(`Source path ${sourcePath} does not exist.`);
      return;
    }
    // 检查目标路径是否存在，如果不存在则创建它
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath);
    }
    // 获取源路径下的所有文件和文件夹
    const files = fs.readdirSync(sourcePath);
    // 遍历文件和文件夹
    files.forEach((file) => {
      const sourceFile = path.join(sourcePath, file);
      const destinationFile = path.join(destinationPath, file);
      // 判断是文件还是文件夹
      if (fs.lstatSync(sourceFile).isDirectory()) {
        // 如果是文件夹，则递归调用copyFolder函数
        copyFolder(sourceFile, destinationFile);
      } else {
        // 如果是文件，则直接复制到目标路径
        fs.copyFileSync(sourceFile, destinationFile);
      }
    });
  }