var Structr = function (fhClass, parent)
{
	if (!parent) parent = Structr.fh();

	var that = Structr.extend(parent, fhClass);
	
	if(!that.__construct)
	{
		that.__construct = function() { };
	}

	that.__construct.prototype = that;

	//allow for easy extending.
	that.__construct.extend = function(child)
	{
		return Structr.closure(child, that);
	}

	that.__construct.replace = function(target)
	{
		Structr.replace(that, target);
	}
	

	//return the constructor
	return that.__construct;
}

Structr.copy = function(from, to, deep)
{
	if(!to) to = {};
	
    for (var i in from) 
    {
        var fromValue = from[i],
			toValue = to[i],
			newValue;
        
        if (typeof fromValue == 'object') 
        {

			//if the toValue exists, and the fromValue is the same data type as the TO value, then
			//merge the FROM value with the TO value, instead of replacing it
			if(toValue && fromValue instanceof toValue.constructor)
			{
				newValue = toValue;
			}
			
			//otherwise replace it, because FROM has priority over TO
			else
			{
				newValue = fromValue instanceof Array ? [] : {};
			}
			
            // newValue = value instanceof Array ? [] : {};
			
            Structr.copy(fromValue, newValue, deep);
        }
        else 
        {
            newValue = fromValue;
        }
        
        to[i] = newValue;
    }
    
    return to;
}

Structr.setPrivate = function(that, property, value)
{

    //grab the PRIVATE property, which will always contain the physical function
    var oldProperty = that.__private[property];
    
    //if the old property, test it a bit before going on.
    if (oldProperty) 
    {
        if (oldProperty.isFinal) 
            throw new Error('property "' + property + '" cannot be overridden.');
        // if(oldProperty.testAbstract) oldProperty.testAbstract(value);
    }
    
    //set the new private value once things are clear
    that.__private[property] = value;
}   
     
//returns number of arguments in function
Structr.getNArgs = function(func)
{
    var args = func.toString().replace(/\{[\W\S]+\}/g, '').match(/\w+(?=[,\)])/g);
    return args ? args.length : 0;
}     
                                
//sets a new property to target object
Structr.setNewProperty = function(that, property, value)
{
    Structr.setPrivate(that, property, value);
    
    that[property] = value;
}    
            
//returns a method owned by an object
Structr.getMethod = function(that, property)
{
    return function()
    {
        return that[property].apply(that, arguments);
    }
}       
                  
//finds all properties with modifiers
Structr.findProperties = function(target, modifier)
{
    var props = [];
    
	for(var property in target)
	{
		var v = target[property];
		
		if(v && v[modifier])
		{
            props.push(property);
		}
	}
    
    return props;
}
                                                 
//used for explicit, or implicit getters
Structr.singletonGet = function(clazz)
{
	return {
		get: function()
		{
			return this._value || (this._value = new clazz());
		}
	}
}         	
//modifies how properties behave in a class
Structr.modifiers =  {

	/**
	 * overrides given method
	 */
	
    m_override: function(that, property, newMethod)
    {
        var oldMethod = (that.__private && that.__private[property]) || that[property] ||
        function()
        {
        }
        
        return function()
        {
            this._super = oldMethod;
            var ret = newMethod.apply(this, arguments);
            delete this._super;
            return ret;
        }
    },
    
    /**
     * overrides given method, but automatically calls super
     */
	
    m_decorate: function(that, property, newMethod)
    {
        var oldMethod = (that.__private && that.__private[property]) || that[property] ||
        function()
        {
        }
        
        return function()
        {
            oldMethod.apply(this, arguments);
            return newMethod.apply(this, arguments);
        }
    },
    
  	/**
  	 * makes sure sub-class conforms to super
  	 */
	
    m_abstract: function(that, property, newMethod)
    {
        var nargs = Structr.getNArgs(newMethod);
        
        newMethod.testAbstract = function(newValue)
        {
            var onargs = Structr.getNArgs(newValue);
            if (nargs != onargs) 
                throw new Error('overridden method "' + property + '" has ' + onargs + ' arguments, expected ' + nargs);
            that[property] = newValue;
        }
        
        return newMethod;
    },
    
	/**
	 * marks properties which CANNOT be overridden
	 */
	
    m_final: function(that, property, newMethod)
    {
        newMethod.isFinal = true;
        return newMethod;
    },
	
    /**
     * getter / setter which are physical functions: e.g: test.myName(), and test.myName('craig')
     */
	
    m_explicit: function(that, property, gs)
    {
        var pprop = '_gs::'+property;
        
        //if GS is not defined, then set defaults.
        if (typeof gs != 'object') 
        {
            gs = {};
        }
        
        if (!gs.get) 
            gs.get = function()
            {
                return this._value;
            }
            
        if (!gs.set) 
            gs.set = function(value)
            {
                this._value = value;
            }
            
            
        return function(value)
        {
            //getter
            if (!arguments.length) 
            {
                this._value = this[pprop];
                var ret = gs.get.apply(this);
                delete this._value;
                return ret;
            }
            
            //setter
            else 
            {
                //don't call the gs if the value isn't the same
                if (this[pprop] == value /* && !gs.uniqueOnly */) 
                    return;
                
                //set the current value to the setter value
                this._value = this[pprop];
                
                //set
                gs.set.apply(this, [value]);
                
                //set the new value. this only matters if the setter set it 
                this[pprop] = this._value;
            }
        };
    },
    
	/**
	 * getters / setters which act variables
	 */
	
    m_implicit: function(that, property, egs)
    {
        //keep the original function available so we can override it
        Structr.setPrivate(that, property, egs);
        
        that.__defineGetter__(property, egs);
        that.__defineSetter__(property, egs);
    }
}               


//extends from one class to another. note: the TO object should be the parent. a copy is returned.
Structr.extend = function(from, to)
{
    if (!to) 
        to = {};
    
    var that = {
        __private: {

			//contains modifiers for all properties of object
			propertyModifiers: {}
		}
    };
    
    if (to instanceof Function) 
        to = to();
    

    Structr.copy(from, that, true);
    var availModifiers = Structr.modifier, usedProperties = {};
	
    
    for (var property in to) 
    {
        var value = to[property];

        
        var propModifiersAr = property.split(' '), //property is at the end of the modifiers. e.g: abstract testProperty
		propertyName = propModifiersAr.pop(),

		modifierList = that.__private.propertyModifiers[propertyName] || (that.__private.propertyModifiers[propertyName] = []);
        

        usedProperties[propertyName] = 1;
        
        if (propModifiersAr.length) 
		{
			var propModifiers = {};
			for (var i = propModifiersAr.length; i--;) 
			{
				var modifier = propModifiersAr[i];
				
				propModifiers['m_' + propModifiersAr[i]] = 1;
				
				if(modifierList.indexOf(modifier) == -1)
				{
					modifierList.push(modifier);
				}
			}
			

			//abstract? children MUST override this, and the parameters must match
			if (propModifiers.m_abstract) 
			{
				value = availModifiers.m_abstract(that, propertyName, value);
			}

			//final set? sub-classes won't be able to override this...
			if (propModifiers.m_final) 
			{
				value = availModifiers.m_final(that, propertyName, value);
			}

			//if explicit, or implicit modifiers are set, then we need an explicit modifier first
			if (propModifiers.m_explicit || propModifiers.m_implicit) 
			{
				value = availModifiers.m_explicit(that, propertyName, value);
			}

			//decorate, or override. NOT both.
			if (propModifiers.m_override) 
			{
				value = availModifiers.m_override(that, propertyName, value);
			}
			else 
			if (propModifiers.m_decorate) 
			{
				value = availModifiers.m_decorate(that, propertyName, value);
			}

			if (propModifiers.m_implicit) 
			{
				//getter is set, don't continue.
				availModifiers.m_implicit(that, propertyName, value);
				continue;
			}
		}
		
		for(var j = modifierList.length; j--;)
		{
			value[modifierList[j]] = true;
		}
		
        Structr.setNewProperty(that, propertyName, value);
    }

	
	//if the parent constructor exists, and the child constructor IS the parent constructor, it means
	//the PARENT constructor was defined, and the  CHILD constructor wasn't, so the parent prop was copied over. We need to create a new function, and 
	//call the parent constructor when the child is instantiated, otherwise it'll be the same class essentially (setting proto)
	if(that.__construct && from.__construct && that.__construct == from.__construct)
	{
		that.__construct = Structr.modifier.m_decorate(that, '__construct', function() { });
	}
    

    for (var propertyName in that) 
    {
		var value = that[propertyName];
		
		//if the value is static, then tack it onto the constructor
		if(value && value['static'])
		{
			that.__construct[propertyName] = value;
			delete that[propertyName];
		}
		
		
        if (usedProperties[propertyName]) 
            continue;
        
        
        //value could be null
        if (value && value.testAbstract) 
            throw new Error('"' + propertyName + '" must be overridden.')
    }
	
    
    
    return that;
}     

Structr.extend = function(that, target)
{
    Structr.copy(Structr.extend(that, target), that);
}
   
                                  
//replaces the properties in the target
Structr.replace = function(that, target)
{
    Structr.copy(Structr.extend(that, target), that);
}   
   
//really.. this isn't the greatest idea if a LOT of objects
//are being allocated in a short perioud of time. use the closure
//method instead. This is great for objects which are instantiated ONCE, or a couple of times :P.
Structr.fh = function(that)
{
    if (!that) 
        that = {};
    
    that = Structr.extend({}, that);
    
    that.getMethod = function(property)
    {
        return Structr.getMethod(this, property);
    }
    
    that.extend = function(target)
    {
        return Structr.extend(this, target);
    }

	//copy to target object
	that.copyTo = function(target)
	{
		Structr.copy(this, target, true);
	}
    
    //replaces that data with new dat. beats writing: MyClass = MyClass.extend(...);
    that.replace = function(target)
    {
        return Structr.replace(this, target);
    }
    
    
    return that;
}

if(exports) exports.Structr = Structr;
