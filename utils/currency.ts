import { writeFileSync, readFileSync } from "fs";

export class Currency {
    file: string = "";
    data: any[] = [];
    engineerId: string = "943698437281562665";

    constructor(file: string) {
        this.file = file;
        this.data = JSON.parse(readFileSync(file,"utf8"));

        setInterval(() => {
            this.save();
        }, 1000 * 60 * 5);
    }

    save() {
        writeFileSync(this.file,JSON.stringify(this.data));
    }

    formatMoney(number: number): string {
        return "<:money:995821789466865764>" + (number/100).toLocaleString("en-US", { style: "currency", currency: "USD" }).substring(1);
    }

    discountPrice(user: string, ammount: number) {
        if (user == "655804021679980560" || user == "855588439663968257" || user == "549099433707569163" || user == "834793042959532094") {
            return Math.floor(ammount * 0.625);
        }
    
        return ammount;
    }

    place(element: any[]) {
        let start = 0, end = this.data.length-1;
        let cash = element[1];
        if (cash == 0) {
            return;
        };
        let result = this.data.length;
        
        if (cash <= this.data[0][1]) {
            this.data.unshift(element);
            return;
        } else if (cash >= this.data[this.data.length-1][1]) {
            this.data.push(element);
            return;
        } else {
            while (start <= end) {
                let mid = Math.floor((start + end)/2);
          
                if (this.data[mid][1] === cash) { 
                    result = mid;
                    this.data.splice(result,0,element);
                    break;
                } else if (this.data[mid-1] != undefined && (this.data[mid-1][1] < cash && this.data[mid][1] > cash)) {
                    result = mid;
                    this.data.splice(result,0,element);
                    break;
                } else if (this.data[mid][1] < cash) {
                    start = mid + 1;
                } else {
                    end = mid - 1;
                }
            }
        }
      
        return false;
    }

    find(user: string) {
        return this.data.findIndex((element) => element[0] == user);
    }

    balance(user: string) {
        let found = this.find(user);
        return found == -1 ? 0 : this.data[found][1];
    }

    transfer(userA: string, userB: string, ammount: number) {
        let indexA = this.find(userA);
        let cashA = indexA == -1 ? 0 : this.data[indexA][1];
        let cashB = this.balance(userB);
        ammount = Math.floor(ammount);
    
        if (userA == this.engineerId && ((cashA-ammount) <= 50000000)) {
            cashA += 50000000;
        }
    
        if (cashA < ammount || userA == userB) {
            return false;
        }
        
        if (indexA != -1) { this.data.splice(indexA, 1); };
        this.place([userA, cashA - ammount]);
    
        let indexB = this.find(userB);
        if (indexB != -1) { this.data.splice(indexB, 1) };
        this.place([userB, cashB + ammount]);
        
        return true;
    }
}