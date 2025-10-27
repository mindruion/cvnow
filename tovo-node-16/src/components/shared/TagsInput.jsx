import React, { useState, useRef, useEffect } from 'react';

const TagsInput = ({
  value = [],
  onChange,
  placeholder = "Add tags...",
  maxItems = 20,
  maxLines = 2,
  className = "",
  disabled = false,
  error = null,
  id = null
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Calculate visible items based on maxLines
  const getVisibleItems = () => {
    if (isExpanded || value.length <= maxItems) {
      return value;
    }
    return value.slice(0, maxItems);
  };

  const getHiddenCount = () => {
    if (isExpanded || value.length <= maxItems) {
      return 0;
    }
    return value.length - maxItems;
  };

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxItems) {
      // Enforce 1-3 words limit
      const words = trimmedTag.split(/\s+/);
      if (words.length <= 3) {
        onChange([...value, trimmedTag]);
      } else {
        // If more than 3 words, take only the first 3
        const limitedTag = words.slice(0, 3).join(' ');
        if (!value.includes(limitedTag)) {
          onChange([...value, limitedTag]);
        }
      }
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      removeTag(value.length - 1);
    } else if (e.key === 'ArrowLeft' && !inputValue && value.length > 0) {
      e.preventDefault();
      // Focus the last tag for editing
      const lastTagIndex = value.length - 1;
      const lastTagElement = document.querySelector(`[data-tag-index="${lastTagIndex}"]`);
      if (lastTagElement) {
        lastTagElement.focus();
      }
    } else if (e.key === 'ArrowRight' && !inputValue && value.length > 0) {
      e.preventDefault();
      // Focus the first tag for editing
      const firstTagElement = document.querySelector(`[data-tag-index="0"]`);
      if (firstTagElement) {
        firstTagElement.focus();
      }
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText.trim().split(/\s+/);
    
    // Process words in chunks of 1-3 words
    const tokens = [];
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ');
      if (chunk.trim()) {
        tokens.push(chunk.trim());
      }
    }
    
    // Add tokens that don't exceed maxItems
    const newTags = [...value];
    tokens.forEach(token => {
      if (token && !newTags.includes(token) && newTags.length < maxItems) {
        newTags.push(token);
      }
    });
    
    if (newTags.length !== value.length) {
      onChange(newTags);
    }
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const visibleItems = getVisibleItems();
  const hiddenCount = getHiddenCount();

  return (
    <div className={`tags-input ${className}`} ref={containerRef}>
      <div 
        className={`tags-input__container ${error ? 'is-invalid' : ''}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {visibleItems.map((tag, index) => (
          <div 
            key={index} 
            className="tags-input__tag"
            data-tag-index={index}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                removeTag(index);
              } else if (e.key === 'ArrowLeft' && index > 0) {
                e.preventDefault();
                const prevTagElement = document.querySelector(`[data-tag-index="${index - 1}"]`);
                if (prevTagElement) {
                  prevTagElement.focus();
                }
              } else if (e.key === 'ArrowRight' && index < visibleItems.length - 1) {
                e.preventDefault();
                const nextTagElement = document.querySelector(`[data-tag-index="${index + 1}"]`);
                if (nextTagElement) {
                  nextTagElement.focus();
                }
              }
            }}
          >
            <span className="tags-input__tag-text">{tag}</span>
            {!disabled && (
              <button
                type="button"
                className="tags-input__tag-remove"
                onClick={() => removeTag(index)}
                aria-label={`Remove ${tag}`}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            )}
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <button
            type="button"
            className="tags-input__more-btn"
            onClick={toggleExpansion}
            disabled={disabled}
          >
            +{hiddenCount} more
          </button>
        )}
        
        {value.length < maxItems && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={value.length === 0 ? placeholder : ""}
            className="tags-input__input"
            disabled={disabled}
          />
        )}
      </div>
      
      {error && (
        <div className="tags-input__error" id={`${id}-error`}>
          {error}
        </div>
      )}
      
      {value.length >= maxItems && (
        <div className="tags-input__limit-message">
          Maximum {maxItems} tags reached
        </div>
      )}
    </div>
  );
};

export default TagsInput;
