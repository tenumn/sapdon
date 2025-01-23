import { Attachable } from "../item/Attachable.js";
import { Food } from "../item/Food.js";
import { Item } from "../item/item.js";

import { GRegistry } from "../registry.js";

//函数工厂
export const ItemAPI = {
    /**
     * 
     * @param {Item} item 
     */
    registerItem: function(item) {
        const item_name = item.identifier.replace(":", "_");
        GRegistry.register(item_name, "behavior", "items/", item);
    },
    /**
     * 物品类 item
     * @param {string} identifier 物品唯一标识符
     * @param {string} category 菜单栏分类 可选："construction", "nature", "equipment", "items", and "none"
     * @param {string} texture 物品纹理
     * @param {Object} options 可选参数
     * @param {string} options.group 分组 
     * @param {boolean} options.hide_in_command 是否在命令中隐藏，默认为 false
     */
    createItem:function(identifier,category, texture, options = {}){
        const item = new Item(identifier,category, texture,options);
        this.registerItem(item)
        return item;
    },
    /**
     * 物品类 food
     * @param {string} identifier 物品唯一标识符
     * @param {string} category 菜单栏分类 可选："construction", "nature", "equipment", "items", and "none"
     * @param {string} texture 物品纹理
     * @param {Object} options 可选参数
     * @param {string} options.group 分组 
     * @param {boolean} options.hide_in_command 是否在命令中隐藏，默认为 false
     * @param {string} options.animation 使用动画，默认为 "eat"
     * @param {boolean} options.canAlwaysEat 是否总是可以食用，默认为 false
     * @param {number} options.nutrition 营养价值，默认为 0
     * @param {number} options.saturationModifier 饱和度修正值，默认为 1
     */
    createFood:function(identifier,category, texture, options = {}){
        const item = new Food(identifier,category, texture, options);
        this.registerItem(item)
        return item;
    },
    createAttachable:function(identifier, texture, material, options = {}){
        const item = new Attachable(identifier)
        item.addTexture("default",texture)
        item.addMaterial("default",material)
        GRegistry.register(item.identifier.replace(":", "_"), "resource", "attachables/", item);
        return item;
    },
}
