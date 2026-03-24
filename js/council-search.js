// Searchable Council Input Component
// Uses dynamic import for lazy loading councils data

class CouncilSearch {
    constructor(inputId, containerId, onSelect) {
        this.input = document.getElementById(inputId);
        this.container = document.getElementById(containerId);
        this.onSelect = onSelect;
        this.selectedCouncil = null;
        this.isDropdownFocused = false;
        this._debounceTimer = null;
        this._selecting = false;
        this._councilsLoaded = false;
        this._councils = null;
        
        this.init();
    }
    
    init() {
        // Create dropdown container
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto hidden';
        this.dropdown.setAttribute('tabindex', '-1'); // Make focusable for blur detection
        this.container.style.position = 'relative';
        this.container.appendChild(this.dropdown);
        
        // Add event listeners - NO focus listener to prevent initial lag
        this.input.addEventListener('input', (e) => this.handleInput(e));
        
        // Show dropdown on click (but with placeholder, not search results)
        this.input.addEventListener('click', () => this.showPlaceholder());
        
        // Improved blur handling
        this.input.addEventListener('blur', () => {
            setTimeout(() => {
                if (!this.container.contains(document.activeElement) && !this._selecting) {
                    this.hideDropdown();
                }
            }, 150);
        });
        
        // Close dropdown on click outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }
    
    // Load councils data on first search
    async _ensureCouncilsLoaded() {
        if (this._councilsLoaded) {
            return this._councils;
        }
        
        try {
            // Dynamic import for lazy loading
            const module = await import('./councils.js');
            this._councils = module.COUNCILS;
            this._councilsLoaded = true;
            return this._councils;
        } catch (error) {
            console.error('Failed to load councils data:', error);
            return [];
        }
    }
    
    // Debounced input handler
    handleInput(e) {
        const query = e.target.value.toLowerCase().trim();
        
        // Clear any pending search
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        
        // If less than 2 chars, show placeholder (not search results)
        if (query.length < 2) {
            this.showPlaceholder();
            return;
        }
        
        // Debounce the search (300ms)
        this._debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }
    
    async performSearch(query) {
        const councils = await this._ensureCouncilsLoaded();
        const matches = councils.filter(council => 
            council.name.toLowerCase().includes(query) ||
            council.id.toLowerCase().includes(query)
        );
        
        // Limit results to 10 for performance
        this.renderDropdown(matches.slice(0, 10), `Results for "${query}"`);
    }
    
    showPlaceholder() {
        this.dropdown.innerHTML = '<div class="p-3 text-gray-400 text-center">Type at least 2 characters to search...</div>';
        this.showDropdown();
    }
    
    renderDropdown(councils, title = null) {
        if (councils.length === 0) {
            this.dropdown.innerHTML = '<div class="p-3 text-gray-500 text-center">No councils found</div>';
            this.showDropdown();
            return;
        }
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        if (title) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50';
            titleDiv.textContent = title;
            fragment.appendChild(titleDiv);
        }
        
        councils.forEach(council => {
            const option = document.createElement('div');
            option.className = 'council-option px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0';
            option.dataset.id = council.id;
            option.dataset.name = council.name;
            option.dataset.address = council.address;
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'font-medium text-gray-900';
            nameDiv.textContent = council.name;
            
            const addressDiv = document.createElement('div');
            addressDiv.className = 'text-sm text-gray-500 truncate';
            addressDiv.textContent = council.address.split('\n')[0];
            
            option.appendChild(nameDiv);
            option.appendChild(addressDiv);
            
            // Direct onclick - more reliable than addEventListener
            option.onclick = (e) => {
                e.stopPropagation();
                this._selecting = true;
                this.selectCouncil({
                    id: council.id,
                    name: council.name,
                    address: council.address
                });
                this._selecting = false;
            };
            
            // Handle mousedown to set selecting flag before blur
            option.onmousedown = () => {
                this._selecting = true;
            };
            
            fragment.appendChild(option);
        });
        
        // Clear and append in one operation
        this.dropdown.innerHTML = '';
        this.dropdown.appendChild(fragment);
        this.showDropdown();
    }
    
    selectCouncil(council) {
        this.selectedCouncil = council;
        this.input.value = council.name;
        this.hideDropdown();
        
        if (this.onSelect) {
            this.onSelect(council);
        }
        
        // Dispatch custom event
        this.input.dispatchEvent(new CustomEvent('councilSelected', { detail: council }));
    }
    
    showDropdown() {
        this.dropdown.classList.remove('hidden');
    }
    
    hideDropdown() {
        this.dropdown.classList.add('hidden');
    }
    
    getSelectedCouncil() {
        return this.selectedCouncil;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const councilInput = document.getElementById('council');
    const councilContainer = document.getElementById('council-container');
    
    if (councilInput && councilContainer) {
        window.councilSearch = new CouncilSearch('council', 'council-container', (council) => {
            // Store in hidden field or data attribute
            councilInput.dataset.councilId = council.id;
            councilInput.dataset.councilAddress = council.address;
        });
    }
});