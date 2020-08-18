/*=============================================================================
 GameoverImageChange.js
----------------------------------------------------------------------------
 (C)2020 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2020/08/18 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc ゲームオーバー画像変更プラグイン
 * @author トリアコンタン
 *
 * @param gameoverList
 * @text 画像とMEのリスト
 * @desc ゲームオーバー画像およびMEの変更条件を設定するリストです。
 * @default []
 * @type struct<Record>[]
 *
 * @help GameoverImageChange.js
 *
 * ゲームオーバー時の画像およびMEを状況に応じて変更します。
 * 画像、ME、そして条件となるスイッチを設定してください。
 * 画像は複数設定でき、複数の条件を満たしたときはリストの上の設定が優先されます。
 *　
 * このプラグインにはプラグインコマンドはありません。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

/*~struct~Record:
 * @param ImageFile
 * @text 画像ファイル
 * @desc 条件で指定したスイッチがONのときに表示されるゲームオーバー画像です。指定しなかった場合はデフォルト画像が表示されます。
 * @default
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param AudioFile
 * @text MEファイル
 * @desc 条件で指定したスイッチがONのときに演奏されるMEのファイル名です。指定しなかった場合はデフォルトMEが演奏されます。
 * @default
 * @require 1
 * @dir audio/me/
 * @type file
 *
 * @param SwitchId
 * @text スイッチ番号
 * @desc 指定した画像、MEを表示するための条件となるスイッチです。
 * @default 1
 * @type switch
 */

(function () {
    'use strict';

    /**
     * Create plugin parameter. param[paramName] ex. param.commandPrefix
     * @param pluginName plugin name(EncounterSwitchConditions)
     * @returns {Object} Created parameter
     */
    var createPluginParameter = function (pluginName) {
        var paramReplacer = function (key, value) {
            if (value === 'null') {
                return value;
            }
            if (value[0] === '"' && value[value.length - 1] === '"') {
                return value;
            }
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        };
        var parameter = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
        PluginManager.setParameters(pluginName, parameter);
        return parameter;
    };

    var param = createPluginParameter('GameoverImageChange');
    if (!param.gameoverList) {
        param.gameoverList = [];
    }

    var _Scene_Gameover_playGameoverMusic = Scene_Gameover.prototype.playGameoverMusic;
    Scene_Gameover.prototype.playGameoverMusic = function() {
        _Scene_Gameover_playGameoverMusic.apply(this, arguments);
        var data = this.findGameoverData();
        if (data && data.AudioFile) {
            this.playGameoverCustomMusic(data.AudioFile);
        }
    };

    Scene_Gameover.prototype.playGameoverCustomMusic = function(name) {
        AudioManager.stopMe();
        var defaultMe = $dataSystem.gameoverMe;
        var me = {
            name: name,
            volume: defaultMe.volume,
            pitch: defaultMe.volume,
            pan: defaultMe.volume
        }
        AudioManager.playMe(me);
    };

    var _Scene_Gameover_createBackground = Scene_Gameover.prototype.createBackground;
    Scene_Gameover.prototype.createBackground = function() {
        _Scene_Gameover_createBackground.apply(this, arguments);
        var data = this.findGameoverData();
        if (data && data.ImageFile) {
            this.changeCustomBackground(data.ImageFile);
        }
    };

    Scene_Gameover.prototype.changeCustomBackground = function(name) {
        this._backSprite.bitmap = ImageManager.loadSystem(name);
    };

    Scene_Gameover.prototype.findGameoverData = function() {
        return param.gameoverList.filter(function (item) {
            return $gameSwitches.value(item.SwitchId);
        })[0];
    };
})();
