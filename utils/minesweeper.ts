let neighbors = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
 
interface TileInterface {
    isMine: boolean;
    flag: boolean;
    number: number;
    covered: boolean;
}

export class Minesweeper {
    grid: any[] = [];
    width = 0;
    height = 0;
    flags = 0;
    mines = 0;
    gameover = false;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        for (let index = 0; index < (width*height); index++) {
            this.grid.push({
                "isMine": false,
                "flag": false,
                "number": 0,
                "covered": true
            });
        }
    }

    inGrid(x: number, y: number) {
        if (x < 0 || x >= this.width) return false;
        if (y < 0 || y >= this.height) return false;
        return true;
    }

    getTile(x: number, y: number): TileInterface {
        if (!this.inGrid(x,y)) throw RangeError(`Position ${x},${y} is not in grid.`);

        return this.grid[x + (y*this.height)];
    }

    placeMine(x: number, y: number) {
        if (!this.inGrid(x,y)) return false;
        if (this.getTile(x,y).isMine) return false;

        this.getTile(x,y).isMine = true;

        neighbors.forEach((e: number[]) => {
            if (this.inGrid(x+e[0],y+e[1])) {
                this.getTile(x+e[0],y+e[1]).number++;
            }
        });

        this.mines++;

        return true;
    }

    flag(x: number, y: number) {
        if (!this.inGrid(x,y)) return false;
        if (!this.getTile(x,y).covered) return false;
        if (this.getTile(x,y).flag) {
            this.flags--;
        } else {
            this.flags++;
        }

        this.getTile(x,y).flag = !this.getTile(x,y).flag;

        return true;
    }

    uncover(x: number, y: number) {
        if (!this.inGrid(x,y) || this.getTile(x,y).flag || !this.getTile(x,y).covered) return;
        if (this.getTile(x,y).isMine) {this.getTile(x,y).covered = false; this.gameover = true; return;}

        this.getTile(x,y).covered = false;

        if (this.getTile(x,y).number == 0) {
            neighbors.forEach((e: number[]) => {
                if (this.inGrid(x+e[0],y+e[1])) {
                    let tile = this.getTile(x+e[0],y+e[1]);
    
                    if ((!tile.isMine && tile.covered) && !tile.flag) {
                        this.uncover(x+e[0],y+e[1]);
                    }
                }
            });
        }
    }
}