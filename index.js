const BROOCHES = [291060, 291061, 291062, 291063, 291064, 291065, 291066, 291067, 293007]
const BROOCH_COOLDOWN = 3 * 60;
const BROOCH_CD_DEBUFF = 301807;
const BROOCH_SKILL_ID = 98150023;
const BROOCH_ACTIVE_IDS = [301806, 301809] //301808


exports.NetworkMod = function reee(mod) {
    mod.game.initialize('inventory')

    let isDebuffActive = false;
    let isBroochBuffActive = false;
    let broochBuffTimeout = null;

    function isBrooch(id)
    {
        return (BROOCHES.indexOf(id) > -1);
    }

    function isBroochBuff(id) {
    	return (BROOCH_ACTIVE_IDS.indexOf(id) > -1);
    }

    function didBroochBuffEndRecently() {
		return broochBuffTimeout != null;
    }

    mod.hook('S_ABNORMALITY_BEGIN', '*', event => {
        if (!mod.game.me.is(event.target)) return

    	if (isBroochBuff(event.id) && event.duration > 1300) {
    		mod.clearTimeout(broochBuffTimeout)
    		setCd(Number(event.duration) + 160000)
    		isDebuffActive = false
    	}

        if (event.id === BROOCH_CD_DEBUFF) {
	    	isDebuffActive = true
    		mod.clearTimeout(broochBuffTimeout)
	        setCd(Number(event.duration))
        }
    })

    mod.hook('S_ABNORMALITY_END', '*', event => {
        if (!mod.game.me.is(event.target)) return

		if (isBroochBuff(event.id) && !isDebuffActive) {
				broochBuffTimeout = mod.setTimeout(() => { setCd(0) }, Number(250))
		}

        if (event.id === BROOCH_CD_DEBUFF) {
        	isDebuffActive = false
	        setCd(0)
			broochBuffTimeout = mod.setTimeout(() => { setCd(0) }, Number(1250))	
        } 
    })

    mod.hook("S_START_COOLTIME_ITEM", 1, event => {
        if (isBrooch(event.item)) {
            event.cooldown = BROOCH_COOLDOWN;
            return true;
        }
	});

    mod.hook("S_START_COOLTIME_SKILL", 3, event => {
        if (event.skill.id == BROOCH_SKILL_ID)
        {
            if(event.cooldown > 156000)
            {
                event.cooldown = BROOCH_COOLDOWN * 1000;
                return true;
            }
            if(event.cooldown == 0)
            {
                setBroochCooldown(0)
                return;
            }
            return false;
        }
    })

	function setSkillCooldown(duration) {
        mod.send('S_START_COOLTIME_SKILL', '*', {
            skill: { reserved: 0, npc: false, type: 1, huntingZoneId: 0, id: BROOCH_SKILL_ID },
            cooldown: duration
        })
	}

	function setBroochCooldown(duration) {
        mod.send('S_START_COOLTIME_ITEM', '*', {
            item: mod.game.inventory.equipment.slots['20'].id,
            cooldown: Math.floor(duration / 1000)
        })
	}

	let a = null;
    function setCd(duration) {
            setSkillCooldown(parseInt(duration));
            let remainder = parseInt(duration) % parseInt(1000);
            mod.clearTimeout(a)
            a = setTimeout(() => {
                setBroochCooldown(parseInt(duration - remainder));
            }, parseInt(remainder));
    }
}