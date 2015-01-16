var MemsRouter = Backbone.Router.extend({
  routes: {
    'areas/:area': 'handleArea',
	'mems/new': 'handleNew',
	'mems/:mem': 'handleMem'
  },
  handleArea: function(url) {
    url = url.split('_').slice(1);
	if (!mems) { this.navigate('/'); return; }
	partMems.reset(
	  mems.filter(function(mem) {
        var result = true,
            areas = mem.get('areas');	  
	    _.each(url, function(part) {
	      if (_.indexOf(areas, part) == -1) result = false;
	    });
	    return result;
	  })
	);
	memsView.collection = partMems;
	memsView.render();
  },
  handleMem: function(url) {
    if (memView) {
	  var mem = mems.findWhere({_id: url});
	  var connectionsNames = [];
	  _.each(mem.get('connections'), function(c) {
	    var model = mems.findWhere({_id: c});
	    if (model) connectionsNames.push(model.get('name'));
	  }, mem);
	  mem.set('connectionsNames', connectionsNames, {silent: true});
	  memView.renderMem(mem);
	}
  },
  handleNew: function() {
    if (memView) memView.renderNewMem();
  }
});

var Areas = Backbone.Model.extend({
  urlRoot: '/areas',
  toObj: function(a) {
    var r = {},
        i, l;
  
    for (i = 0, l = a.length; i < l; i++) {
      if (a[i][0] in r) {
        r[a[i].shift()].push(a[i]);
      } else {
        if (a[i][0]) {
          r[a[i][0]] = [];
          r[a[i].shift()].push(a[i]);
        }
      }
    }
  
    for (i in r) {
      if (r[i].length) {
        r[i] = this.toObj(r[i]);
      }
    }
  
    return r;
  } 
});

var AreasView = Backbone.View.extend({
  events: {
    'click': function(ev) {
	  var url = decodeURIComponent(ev.target.href);
	  url = url.split('#')[1];
	  if (url != 'newmem') {
	    memsRouter.navigate('#' + 'areas/'+ url, {trigger: true});
	  } else {
	    memsRouter.navigate('#mems/new', {trigger: true});
	  }
	}
  },
  el: '#areas',
  addAreas: function(el, area, id) {
    if (!_.isEmpty(area)) {
      _.each(area, function(obj, prop) {
        var child = this.addLink(el, prop, id);
        this.addAreas(child.child, obj, child.id);
      }, this);
    } else { el.style.display = 'none'; }
  },
  addLink: function(el, prop, id) {
    var a = document.createElement('a'),
        d = document.createElement('div'),
	    nextId = id + '_' + prop,
	    child;
  
    a.setAttribute('href', '#' + nextId);
    a.classList.add('list-group-item');
    a.setAttribute('data-toggle', 'collapse');
    a.setAttribute('data-parent', "#" + id);
    d.classList.add('collapse');
    d.classList.add('list-group-submenu'); 
    d.setAttribute('id', nextId);
 
    a.innerHTML = prop; 
    el.appendChild(a);
    child = el.appendChild(d);
  
    return {child: child, id: nextId};
  }
});

var Mems = Backbone.Collection.extend({
  url: '/mems'
});

var MemsView = Backbone.View.extend({
  el: '#mems',
  initialize: function(options) {
    this.collection = options.collection;
  },
  template: _.template($('#memsTemplate').html()),
  render: function() {
    this.$el.html(this.template({mems: _.pluck(this.collection.models, 'attributes')}));
  }
});

var MemView = Backbone.View.extend({
  events: {
    'click .listOfMems': function(ev) {
	  var id = decodeURIComponent(ev.target.href)
	           .split('#mems/')[1];
	  memsRouter.navigate('#mems/' + id, {trigger: true});
	},
	'click #send': function(ev) {
	  mems.create({
	    name: this.$('#newName').val(),
	    code: this.$('#newCode').val(),
	    areas: this.$('#newAreas').val().split(','),
	    connections: this.$('#newConnections').val().split(',')
	  });
	},
	'click .updateMem': function(ev) {
	  var id = document.location.href.split('#mems/')[1];
	  if (memView) {
	    memView.renderUpdateMem(mems.findWhere({_id: id}));
	  }
	},
	'click .deleteMem': function(ev) {
	  var id = document.location.href.split('#mems/')[1];
	  mems.remove(mems.findWhere({_id: id}));
	  var xhr = new XMLHttpRequest();
	  xhr.open('Get', '/delete/'+id, true);
	  xhr.send();
	},
	'click #update': function() {
	  var mem = {
	    name: $('#uName').val(),
	    code: $('#uCode').val(),
	    areas: $('#uAreas').val().split(','),
	    connections: $('#uConnections').val().split(','),
		_id: $('#uId').val()
	  };
	  mems.remove(mems.findWhere({_id: mem._id}));
	  mems.create(mem);
	}
  },
  el: '#mems',
  memTemplate: _.template($('#memTemplate').html()),
  newMemTemplate: _.template($('#newMemTemplate').html()),
  updateMemTemplate: _.template($('#updateMemTemplate').html()),
  renderMem: function(model) {
    this.$el.html(this.memTemplate({mem: model.attributes}));
  },
  renderNewMem: function() {
    this.$el.html(this.newMemTemplate());
  },
  renderUpdateMem: function(model) {
    this.$el.html(this.updateMemTemplate({mem: model.attributes}));
  }
});

var memsRouter = new MemsRouter;
Backbone.history.start();
var areas = new Areas;
var areasView = new AreasView;
var mems = new Mems;
var partMems = new Mems;
var memsView = new MemsView({collection: mems});
var memView = new MemView;


areas.fetch({success: function(model) {
    model.set({areas: model.toObj(model.get('areas'))});
    areasView.addAreas(areasView.el, model.get('areas'), 'areas');
    areasView.$el.append('<a href="#newmem" class="list-group-item" data-toggle="collapse" data-parent="#areas">новый</a>');	
  }
});

mems.fetch({success: function(collection) {
    memsView.render();
  }
});
