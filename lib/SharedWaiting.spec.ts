import SharedWaiting from './SharedWaiting'

describe('SharedWaiting',function () {
	it('Shares waiting for two promise chains (resolve)',async function(){
		const sharedRes = {id:1234}
		const shared = new SharedWaiting('Task1',async()=>sharedRes)
		const res = await Promise.all([
			shared.getRun('Route1')(),
			shared.getRun('Route2')()
		])
		expect(res).toEqual([sharedRes,sharedRes])
		expect(res[0]).toBe(res[1]) // its the same resolved object
	})
	it('Shares waiting for two promise chains (reject)',function(){
		const thrower = async()=>{
			throw new Error('Sample Error')
		}
		const shared = new SharedWaiting('Task1',thrower)
		const fn1 = shared.getRun('Route1')
		const fn2 = shared.getRun('Route2')
		const res = Promise.all([
			fn1(),
			fn2()
		])
		expect(res).rejects.toEqual(new Error('Sample Error'))
	})
	it('Changes Active state with lifecycle',async ()=>{
		const sharedRes = {id:1234}
		const shared = new SharedWaiting('Task1',async()=>sharedRes)
		expect(shared.active).toBe(true)
		await shared.getRun('Route1')()
		expect(shared.active).toBe(false)
	})
	it('Only calls the First Function and only once', async ()=>{
		const fnMock = jest.fn(async(val)=>val + 2)
		const shared = new SharedWaiting('Task1',fnMock)
		const fn1 = shared.getRun('Route1')
		const fn2 = shared.getRun('Route2')
		const res = await Promise.all([
			fn2(6),
			fn1(11)
		])
		expect(fnMock.mock.calls.length).toEqual(1)
		expect(fnMock.mock.calls[0][0]).toBe(6)
		expect(res).toEqual([8,8])
	})
	it('Tracks which routes have requests a fn and which have used it', async ()=>{
		const fnMock = jest.fn(async(val)=>val + 2)
		const shared = new SharedWaiting('Task1',fnMock)
		const fn1 = shared.getRun('Route1')
		const fn2 = shared.getRun('Route2')
		const fn3 = shared.getRun('Route3')
		expect(shared.routes).toEqual(['Route1','Route2','Route3'])
		await fn2(6)
		expect(shared.routes).toEqual(['Route1','Route3'])
		await fn1(6)
		expect(shared.routes).toEqual(['Route3'])
		await fn3(4)
	})
	// body...
})