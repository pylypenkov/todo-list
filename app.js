var backController = (function () {

    var TodoItem = function (id, description, important, done) {
        this.id = id;
        this.description = description;
        this.important = important;
        this.done = done;
    };

    TodoItem.prototype.toggleDone = function () {
        this.done = !this.done;
    };

    TodoItem.prototype.toggleImportant = function () {
        this.important = !this.important;
    };

    var data = {
        todoList: []
    };

    var getIdFromEl = function (el) {
        return parseInt(el.id.split('-')[1]);
    };

    var searchId = function (el) {
        var id, ids, index;

        id = getIdFromEl(el);

        ids = data.todoList.map(function (cur) {
            return cur.id;
        });

        index = ids.indexOf(id);

        return index;
    };

    return {
        addItem: function (descr, imp) {
            var ID, newItem;

            if (data.todoList.length > 0) {
                ID = data.todoList[data.todoList.length - 1].id+1;
            } else {
                ID = 0;
            }

            newItem = new TodoItem(ID, descr, imp, false);

            data.todoList.push(newItem);

            return newItem;
        },

        removeItem: function(el) {
            var ind = searchId(el);

            if (ind !== -1) {
                data.todoList.splice(ind, 1);
            }
        },

        toggleItemDone: function(el) {
            var ind = searchId(el);

            if (ind !== -1) {
                data.todoList[ind].toggleDone();
            }
        },

        toggleItemImportant: function(el) {
            var ind = searchId(el);

            if (ind !== -1) {
                data.todoList[ind].toggleImportant();
            }
        },

        getStat: function () {
            var done = [];

            done[0] = data.todoList.filter(function (cur) {
                return cur.done;
            }).length;

            done[1] = data.todoList.length - done[0];

            return done;
        },

        getFilteredList: function (filter) {
            var filteredList = data.todoList;

            if (filter) {

                if (filter === 'active') {

                    filteredList = data.todoList.filter(function (cur) {
                        if (!cur.done ) return cur;
                    });

                } else if (filter === 'done') {

                    filteredList = data.todoList.filter(function (cur) {
                        if (cur.done) return cur;
                    });
                }

                return filteredList;
            }
        },

        getNewFilteredList: function (state) {
            var filteredList = data.todoList;

            if (state.filter) {

                if (state.filter === 'active') {

                    filteredList = data.todoList.filter(function (cur) {
                        if (!cur.done ) return cur;
                    });

                } else if (state.filter === 'done') {

                    filteredList = data.todoList.filter(function (cur) {
                        if (cur.done) return cur;
                    });
                }
            }

            if (state.search) {
                filteredList = filteredList.filter(function (cur) {
                    if (cur.description.indexOf(state.search) !== -1 ) return cur;
                });
            }

            return filteredList;
        }
    }
})();

var UIController = (function () {

    var DOMstrings = {
        btnAdd: '.btn--add',
        inputAdd: '.input--add',
        inputImportant: '.input--important',
        todoList: '.todo-list-container',
        btnDel: '.btn--del',
        btnImportant: '.btn--important',
        todoItemText: '.todo-item__text',
        todoStatistic: '.todo__statistic',
        todoFilter: '.todo-filter',
        todoSearch: '.todo-search'
    };

    return {
        getDOMstrings: function () {
            return DOMstrings;
        },

        getInput: function () {
            return {
                description: document.querySelector(DOMstrings.inputAdd).value,
                important: document.querySelector(DOMstrings.inputImportant).checked
            }
        },
        
        addListItem: function (obj) {
            var html, newHtml, element;

            element = document.querySelector(DOMstrings.todoList);

            html = '<div class="todo-item %important% %done%" id="todo-%id%">\n' +
'                        <div class="todo-item__text">%description%</div>\n' +
'                        <div class="todo-item__action">\n' +
'                            <button class="btn btn-outline-danger btn--del"><i class="far fa-trash-alt"></i></button>\n' +
'                            <button class="btn btn-outline-success btn--important"><i class="fas fa-exclamation"></i></button>\n' +
'                        </div>\n' +
'                    </div>';

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);

            if (obj.important) {
                newHtml = newHtml.replace('%important%', 'important');
            } else {
                newHtml = newHtml.replace('%important%', '');
            }

            if (obj.done) {
                newHtml = newHtml.replace('%done%', 'done');
            } else {
                newHtml = newHtml.replace('%done%', '');
            }

            element.insertAdjacentHTML('beforeend', newHtml);


        },

        toggleItemDone: function (item) {
            item.classList.toggle('done');
        },

        toggleImportant: function (item) {
            item.classList.toggle('important');
        },

        delItem: function (item) {
            item.parentNode.removeChild(item);
        },

        showStat: function (stat) {
            var el;

            el = document.querySelector(DOMstrings.todoStatistic);

            el.innerHTML = stat[1] + ' more to do, ' + stat[0] + ' done';

        },
        
        clearFields: function () {
            var descrInput = document.querySelector(DOMstrings.inputAdd);
            descrInput.value = '';
            descrInput.focus();
            document.querySelector(DOMstrings.inputImportant).checked = false;
        },

        updateFilterTodoList: function (arr, type) {
            var targ = event.target;

            document.querySelector(DOMstrings.todoList).innerHTML = '';

            for (var i=0; i < arr.length; i++) {
                this.addListItem(arr[i]);
            }

            targ.parentElement.querySelectorAll('.btn').forEach(function (cur) {
                cur.classList.remove('active')
            });

            targ.classList.add('active');
        },

    }
    
})();

var appController = (function (UICtrl, backCtrl) {

    var filterState = {
        search: '',
        filter: 'all'
    };

    var hasClass = function (el, className) {
        return el.classList.contains(className);
    };

    var setupEventListener = function () {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.btnAdd).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.whitch ===13 ) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.todoSearch).addEventListener('keyup', function () {
            filterState.search = this.value;

            ctrlSearchTodoList(filterState);
        });


        document.querySelector(DOM.todoList).addEventListener('click', ctrlItemAction);

        document.querySelector(DOM.todoFilter).addEventListener('click', function () {

            filterState.filter = event.target.getAttribute('data-filter');

            ctrlFilterTodoList(filterState);
        });

    };

    var ctrlAddItem = function () {
        var input = UICtrl.getInput();

        if (input.description !== '') {
            var newItem = backCtrl.addItem(input.description, input.important);

            UICtrl.addListItem(newItem);
            ctrlUpdateStat();
            UICtrl.clearFields();

        }
    };

    var ctrlUpdateStat = function () {
        var stat = backController.getStat();

        UICtrl.showStat(stat);
    };

    var ctrlItemAction = function (event) {
        var DOM = UICtrl.getDOMstrings();

        var targ, targItem, id;

        targ = event.target;

        targItem = targ.closest('.todo-item');


        if (hasClass(targ, DOM.btnDel.slice(1, DOM.btnDel.length)) || hasClass(targ.parentNode, DOM.btnDel.slice(1, DOM.btnDel.length))) {

            backCtrl.removeItem(targItem);
            UICtrl.delItem(targItem);
            ctrlUpdateStat();

        } else if (hasClass(targ,  DOM.btnImportant.slice(1, DOM.btnImportant.length)) || hasClass(targ.parentNode,  DOM.btnImportant.slice(1, DOM.btnImportant.length))) {

            backCtrl.toggleItemImportant(targItem);
            UICtrl.toggleImportant(targItem);

        } else if (hasClass(targ,  DOM.todoItemText.slice(1, DOM.todoItemText.length))) {

            backCtrl.toggleItemDone(targItem);
            UICtrl.toggleItemDone(targItem);
            ctrlUpdateStat();
        }
    };

    var ctrlFilterTodoList = function (state) {

        var filteredList = backController.getNewFilteredList(state);

        UICtrl.updateFilterTodoList(filteredList, state.filter);
    };

    var ctrlSearchTodoList = function (state) {

        var filteredList = backController.getNewFilteredList(state);

        UICtrl.updateFilterTodoList(filteredList, state.filter);
    };

    return {
        init: function () {
            setupEventListener();
            ctrlUpdateStat();
            UICtrl.clearFields();
        }
    }

    
})(UIController, backController);

appController.init();