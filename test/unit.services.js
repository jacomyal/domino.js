// Shortcuts:
module('Shortcuts management');
test('test 1', function() {
  var d = new domino({
    shortcuts: [
      {
        id: 'a',
        method: function() {
          return 'ahah';
        }
      }
    ]
  });

  deepEqual(d.expand(':a'), 'ahah', 'The shortcut expanding works!');
});
test('test 2', function() {
  var d = new domino({
    shortcuts: [
      {
        id: 'a',
        method: function() {
          return 'ahah' + this.expand(':b');
        }
      },
      {
        id: 'b',
        method: function() {
          return 'ohoh';
        }
      }
    ]
  });

  deepEqual(d.expand(':a'), 'ahahohoh', 'The recursive shortcut expanding works!');
});

// Services: