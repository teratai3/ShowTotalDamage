/*:
 * @plugindesc トータルダメージ表示
 * @author terao
 *
 * @param 与えたダメージを表示
 * @desc 与えたダメージを表示する (0:OFF 1:ON)
 * @default 1
 * 
 * @param 受けたダメージを表示
 * @desc 受けたダメージを表示する (0:OFF 1:ON)
 * @default 1
 * 
 * @help 戦闘終了時に各キャラクター事にトータルダメージを表示します。
 */

(() => {
    const pluginName = "ShowTotalDamage";

    let param = PluginManager.parameters(pluginName);

    const DamageFlag = Number(param['与えたダメージを表示']) || 0;
    const DamageHurtFlag = Number(param['受けたダメージを表示']) || 0;

    const _Game_Actor_initialize = Game_Actor.prototype.initialize;

    Game_Actor.prototype.initialize = function (actorId) {
        _Game_Actor_initialize.call(this, actorId);
        this._totalDamage = 0; // 与えたダメージ
        this._totalDamageHurt = 0; // 受けたダメージ
    }

    // Game_Actor クラスにトータルダメージのゲッターとセッターを追加
    Game_Actor.prototype.getTotalDamage = function () {
        return this._totalDamage || 0;
    };

    Game_Actor.prototype.setAddDamage = function (damage) {
        this._totalDamage += damage;
    };


    Game_Actor.prototype.getTotalDamageHurt = function () {
        return this._totalDamageHurt || 0;
    };

    Game_Actor.prototype.setAddDamageHurt = function (damage) {
        this._totalDamageHurt += damage;
    };

    // executeDamage メソッドをオーバーライド
    let _Game_Action_executeDamage = Game_Action.prototype.executeDamage;
    Game_Action.prototype.executeDamage = function (target, damage) {
        _Game_Action_executeDamage.call(this, target, damage);
        if (damage > 0) {
            if (target.isEnemy()) {
                const actor = this.subject(); //行動したキャラクターを取得
                actor.setAddDamage(damage); // ダメージを記録
            } else if (target.isActor()) {
                target.setAddDamageHurt(damage); // 受けたダメージを記録
            }
        }
    };

    // オリジナルの BattleManager.endBattle を上書き
    const originalEndBattle = BattleManager.endBattle;
    BattleManager.endBattle = function (result) {
        originalEndBattle.call(this, result);
        this.showTotalDamage();
    };

    // 合計ダメージを計算して表示するメソッド
    BattleManager.showTotalDamage = function () {
        const messages = []; // メッセージを格納するための空の配列を用意

        $gameParty.members().forEach(actor => {
            const parts = [];
            let hasMessage = false;
    
            if (DamageFlag === 1) {
                parts.push(`が与えた合計ダメージ: ${actor.getTotalDamage()}`);
                hasMessage = true;
            }
            if (DamageHurtFlag === 1) {
                parts.push(`受けた合計ダメージ: ${actor.getTotalDamageHurt()}`);
                hasMessage = true;
            }
    
            // メッセージがある場合のみ追加する
            if (hasMessage) {
                messages.push(actor.name() + " " + parts.join(', '));
            }
        });

        // 何も表示しない場合はここで終了
        if (messages.length === 0) return;
        
        messages.forEach(message => {
            $gameMessage.add(message); // ゲーム内メッセージウィンドウに表示
        });
    };

})();
