class MyTree {
  private tree = [
    {id: 1, name: 'kritchanon1', parent: null},
    {id: 2, name: 'kritchanon2', parent: 1},
    {id: 3, name: 'kritchanon3', parent: 1},
    {id: 4, name: 'kritchanon4', parent: 1},
    {id: 5, name: 'kritchanon5', parent: null},
    {id: 6, name: 'kritchanon6', parent: 5},
    {id: 7, name: 'kritchanon7', parent: 5},
  ];

  traverseTree = (parent?: any) => {
    if (parent === undefined) {
      parent = null;
    }

    const _this = this;

    const ar: Array<object> = [];
    _this.tree.forEach(
      (obj: {
        id: number;
        name: string;
        parent: any;
        children?: Array<object | any>;
      }) => {
        if (parent === obj.parent) {
          const children = _this.traverseTree(obj.id);
          obj.children = children;
          ar.push(obj);
        }
      },
    );

    return ar;
  };
}

export default MyTree;
